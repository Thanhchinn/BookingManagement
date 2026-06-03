import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAdminDto } from './dto/login-admin.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { SendOtpDto } from './dto/send-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ==========================================
  // ĐĂNG NHẬP DÀNH CHO ADMIN
  // ==========================================
  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  async loginAdmin(@Body() loginAdminDto: LoginAdminDto) {
    const admin = await this.authService.validateAdmin(
      loginAdminDto.username,
      loginAdminDto.password,
    );
    return this.authService.loginAdmin(admin);
  }

  // ==========================================
  // ĐĂNG NHẬP DÀNH CHO KHÁCH HÀNG (USER)
  // ==========================================
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async loginUser(@Body() loginUserDto: LoginUserDto) {
    const user = await this.authService.validateUser(
      loginUserDto.email,
      loginUserDto.password,
    );
    return this.authService.loginUser(user);
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
