import { Controller, Post, Body, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAdminDto } from './dto/login-admin.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ==========================================
  // ĐĂNG NHẬP DÀNH CHO ADMIN
  // ==========================================
  @Post('admin/login')
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
      secure: false, // false cho local dev HTTP, set true khi chạy HTTPS
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    return result;
  }

  // ==========================================
  // ĐĂNG NHẬP DÀNH CHO KHÁCH HÀNG (USER)
  // ==========================================
  @Post('login')
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
      secure: false,
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
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return this.authService.sendOtp(sendOtpDto.email);
  }

  // ==========================================
  // ĐĂNG KÝ DÀNH CHO KHÁCH HÀNG (USER)
  // ==========================================
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.registerUser(registerUserDto);
  }
}
