import { Injectable, UnauthorizedException, ConflictException, BadRequestException, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { createHash, randomInt, timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dto/register-user.dto';

const OTP_TTL_MS = 5 * 60 * 1000; // Hiệu lực 5 phút
const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // Tối thiểu 60 giây giữa 2 lần gửi
const OTP_MAX_ATTEMPTS = 5; // Nhập sai quá 5 lần thì hủy mã

function hashOtp(email: string, otp: string): string {
  return createHash('sha256').update(`${email}:${otp}`).digest('hex');
}

// Hash giả (bcrypt cost 10) dùng khi tài khoản không tồn tại
const DUMMY_HASH = '$2b$10$udT0fbixKHEtZRupSwp9EeLzi57WwjkegWKnXmVqBKS2O9OpYpHeq';
// Thông báo chung cho mọi lỗi đăng nhập để không lộ email/tài khoản nào tồn tại
const INVALID_CREDENTIALS = 'Thông tin đăng nhập không chính xác';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // ==========================================
  // LOGIC ĐĂNG NHẬP / XÁC THỰC CHO ADMIN
  // ==========================================
  async validateAdmin(identifier: string, pass: string): Promise<any> {
    const admin = await this.prisma.admin.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier },
        ],
      },
      omit: { password: false },
    });

    // Luôn so sánh bcrypt (kể cả khi không có tài khoản) để thời gian phản hồi không lộ thông tin
    const isMatch = await bcrypt.compare(pass, admin?.password ?? DUMMY_HASH);
    if (!admin || !isMatch) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    if (!admin.isActive) {
      throw new UnauthorizedException('Tài khoản quản trị viên đã bị vô hiệu hóa');
    }

    return admin;
  }

  async loginAdmin(admin: any) {
    const payload = { 
      sub: admin.id.toString(), 
      username: admin.username, 
      role: admin.role 
    };

    return {
      access_token: this.jwtService.sign(payload),
      admin: {
        id: admin.id.toString(),
        username: admin.username,
        fullName: admin.fullName,
        role: admin.role,
      },
    };
  }

  // ==========================================
  // LOGIC ĐĂNG NHẬP / ĐĂNG KÝ CHO KHÁCH HÀNG (USER)
  // ==========================================
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      omit: { password: false },
    });

    const isMatch = await bcrypt.compare(pass, user?.password ?? DUMMY_HASH);
    if (!user || user.deletedAt || !isMatch) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    return user;
  }

  async loginUser(user: any) {
    const payload = {
      sub: user.id.toString(),
      email: user.email,
      role: 'USER'
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id.toString(),
        email: user.email,
        fullName: user.fullName,
        phone: user.phone || null,
        avatarUrl: user.avatarUrl || null,
        loyaltyPoints: user.loyaltyPoints,
      }
    };
  }

  // GỬI MÃ OTP XÁC THỰC EMAIL (LƯU VÀO CƠ SỞ DỮ LIỆU)
  async sendOtp(email: string) {
    const formattedEmail = email.trim().toLowerCase();

    // 1. Kiểm tra email duy nhất
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: formattedEmail },
    });
    if (existingEmail) {
      throw new ConflictException('Địa chỉ email này đã được sử dụng đăng ký tài khoản');
    }

    // 2. Chống spam: phải chờ hết thời gian chờ mới được gửi lại
    const existingOtp = await this.prisma.otpVerification.findUnique({
      where: { email: formattedEmail },
    });
    if (existingOtp && Date.now() - existingOtp.createdAt.getTime() < OTP_RESEND_COOLDOWN_MS) {
      throw new HttpException('Vui lòng chờ 60 giây trước khi yêu cầu mã mới.', HttpStatus.TOO_MANY_REQUESTS);
    }

    // 3. Sinh mã OTP 6 chữ số bằng bộ sinh số ngẫu nhiên an toàn
    const otp = randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);
    const otpHash = hashOtp(formattedEmail, otp);

    // 4. Chỉ lưu hash của OTP vào DB
    await this.prisma.otpVerification.upsert({
      where: { email: formattedEmail },
      update: {
        otpCode: otpHash,
        attempts: 0,
        expiresAt,
        createdAt: new Date(),
      },
      create: {
        email: formattedEmail,
        otpCode: otpHash,
        expiresAt,
      },
    });

    // 5. TODO: gửi email thật (nodemailer / dịch vụ email). Tạm thời chỉ in ra log khi chạy dev.
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`[DEV] Mã OTP cho ${formattedEmail}: ${otp} (hết hạn ${expiresAt.toLocaleTimeString()})`);
    }

    // Không bao giờ trả mã OTP về cho client
    return {
      message: 'Mã xác thực OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.',
    };
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    const { email, password, fullName, phone, otpCode } = registerUserDto;
    const formattedEmail = email.trim().toLowerCase();

    // 1. Xác thực mã OTP từ Database
    const otpRecord = await this.prisma.otpVerification.findUnique({
      where: { email: formattedEmail },
    });

    if (!otpRecord) {
      throw new BadRequestException('Vui lòng yêu cầu gửi mã OTP xác thực email trước khi đăng ký');
    }

    if (new Date() > otpRecord.expiresAt || otpRecord.attempts >= OTP_MAX_ATTEMPTS) {
      await this.prisma.otpVerification.delete({ where: { email: formattedEmail } }).catch(() => {});
      throw new BadRequestException('Mã xác thực OTP đã hết hạn hoặc bị khóa. Vui lòng yêu cầu mã mới.');
    }

    const expected = Buffer.from(otpRecord.otpCode, 'hex');
    const actual = Buffer.from(hashOtp(formattedEmail, String(otpCode ?? '')), 'hex');
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      await this.prisma.otpVerification.update({
        where: { email: formattedEmail },
        data: { attempts: { increment: 1 } },
      });
      const remaining = OTP_MAX_ATTEMPTS - otpRecord.attempts - 1;
      throw new BadRequestException(
        remaining > 0
          ? `Mã xác thực OTP không chính xác (còn ${remaining} lần thử).`
          : 'Mã xác thực OTP không chính xác. Mã đã bị khóa, vui lòng yêu cầu mã mới.',
      );
    }

    // Xóa mã OTP khỏi database sau khi xác thực thành công để bảo vệ bảo mật
    await this.prisma.otpVerification.delete({ where: { email: formattedEmail } }).catch(() => {});

    // 2. Kiểm tra email duy nhất một lần nữa (phòng ngừa tranh chấp đồng thời)
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: formattedEmail },
    });
    if (existingEmail) {
      throw new ConflictException('Địa chỉ email này đã được sử dụng đăng ký tài khoản');
    }

    // 3. Kiểm tra số điện thoại duy nhất (nếu có)
    if (phone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone },
      });
      if (existingPhone) {
        throw new ConflictException('Số điện thoại này đã được sử dụng đăng ký tài khoản');
      }
    }

    // 4. Mã hóa mật khẩu an toàn
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Tạo người dùng mới trong database
    const newUser = await this.prisma.user.create({
      data: {
        email: formattedEmail,
        fullName,
        password: hashedPassword,
        phone: phone || null,
        isActive: true,
        loyaltyPoints: 0,
        emailVerifiedAt: new Date(), // Email đã được xác thực qua OTP
      },
    });

    // 6. Trả về thông điệp thành công mà không tự động đăng nhập (yêu cầu người dùng tự đăng nhập sau)
    return {
      message: 'Đăng ký tài khoản thành công! Vui lòng sử dụng thông tin này để đăng nhập.',
      user: {
        id: newUser.id.toString(),
        email: newUser.email,
        fullName: newUser.fullName,
      }
    };
  }
}
