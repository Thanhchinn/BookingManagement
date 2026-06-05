import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
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
    });

    if (!admin) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không hợp lệ');
    }

    if (!admin.isActive) {
      throw new UnauthorizedException('Tài khoản quản trị viên đã bị vô hiệu hóa');
    }

    const isMatch = await bcrypt.compare(pass, admin.password);
    if (!isMatch) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không hợp lệ');
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
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }



    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
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

    // 2. Sinh mã OTP 6 chữ số ngẫu nhiên
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Hiệu lực trong 5 phút

    // 3. Lưu hoặc cập nhật mã OTP vào bảng OtpVerification trong Postgres DB
    await this.prisma.otpVerification.upsert({
      where: { email: formattedEmail },
      update: {
        otpCode: otp,
        expiresAt,
        createdAt: new Date(),
      },
      create: {
        email: formattedEmail,
        otpCode: otp,
        expiresAt,
      },
    });

    // 4. Ghi nhận mã xác thực ra Console Log để test
    console.log('\n=============================================================');
    console.log(`[OTP SERVICE - DB] MÃ XÁC THỰC CỦA BẠN LÀ: ${otp}`);
    console.log(`[OTP SERVICE - DB] Email nhận: ${email}`);
    console.log(`[OTP SERVICE - DB] Hiệu lực đến: ${expiresAt.toLocaleTimeString()}`);
    console.log('=============================================================\n');

    return {
      message: 'Mã xác thực OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư (hoặc database bảng otp_verifications).',
      devOtp: otp
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

    if (otpRecord.otpCode !== otpCode) {
      throw new BadRequestException('Mã xác thực OTP không chính xác');
    }

    if (new Date() > otpRecord.expiresAt) {
      await this.prisma.otpVerification.delete({ where: { email: formattedEmail } }).catch(() => {});
      throw new BadRequestException('Mã xác thực OTP đã hết hạn hiệu lực');
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
