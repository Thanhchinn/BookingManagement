import { IsBoolean, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { AdminRole } from '@prisma/client';
import { ADMIN_ROLES } from '../../auth/auth.constants';

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống.' })
  @MaxLength(50)
  username: string;

  @IsEmail({}, { message: 'Định dạng email không hợp lệ.' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự.' })
  password: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  @IsIn(ADMIN_ROLES, { message: 'Vai trò không hợp lệ.' })
  @IsOptional()
  role?: AdminRole;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateAdminDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  username?: string;

  @IsEmail({}, { message: 'Định dạng email không hợp lệ.' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự.' })
  password?: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  @IsIn(ADMIN_ROLES, { message: 'Vai trò không hợp lệ.' })
  @IsOptional()
  role?: AdminRole;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
