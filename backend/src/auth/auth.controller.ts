import { Controller, Post, Body, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAdminDto } from './dto/login-admin.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { Public } from './decorators/public.decorator';

// Cookie chỉ bật `secure` khi chạy production (HTTPS)
const COOKIE_SECURE = process.env.NODE_ENV === 'production';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ==========================================
  // ĐĂNG NHẬP DÀNH CHO ADMIN
  // ==========================================
  @Post('admin/login')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // Chống dò mật khẩu: 10 lần/phút/IP
  @HttpCode(HttpStatus.OK)
  async loginAdmin(
    @Body() loginAdminDto: LoginAdminDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const admin = await this.authService.validateAdmin(
      loginAdminDto.username,
      loginAdminDto.password,
    );
    const result = await this.authService.loginAdmin(admin);

    res.cookie('admin_token', result.access_token, {
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    return result;
  }

  // ==========================================
  // ĐĂNG NHẬP DÀNH CHO KHÁCH HÀNG (USER)
  // ==========================================
  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async loginUser(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(
      loginUserDto.email,
      loginUserDto.password,
    );
    const result = await this.authService.loginUser(user);

    res.cookie('user_token', result.access_token, {
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    return result;
  }

  // ==========================================
  // ĐĂNG XUẤT (XÓA COOKIES)
  // ==========================================
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('user_token');
    res.clearCookie('admin_token');
    return { message: 'Đăng xuất thành công' };
  }

  // ==========================================
  // GỬI MÃ OTP XÁC THỰC EMAIL ĐĂNG KÝ
  // ==========================================
  @Post('send-otp')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return this.authService.sendOtp(sendOtpDto.email);
  }

  // ==========================================
  // ĐĂNG KÝ DÀNH CHO KHÁCH HÀNG (USER)
  // ==========================================
  @Post('register')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  async registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.registerUser(registerUserDto);
  }
}
