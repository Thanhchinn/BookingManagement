import { 
  IsEmail, 
  IsNotEmpty, 
  IsString, 
  MinLength, 
  IsOptional, 
  IsBoolean, 
  IsInt, 
  Min 
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Họ và tên phải là chuỗi ký tự.' })
  @IsNotEmpty({ message: 'Họ và tên không được để trống.' })
  @MinLength(2, { message: 'Họ và tên phải có ít nhất 2 ký tự.' })
  fullName: string;

  @IsEmail({}, { message: 'Định dạng email không hợp lệ.' })
  @IsNotEmpty({ message: 'Email không được để trống.' })
  email: string;

  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự.' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống.' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự.' })
  password: string;

  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự.' })
  @IsOptional()
  phone?: string;

  @IsString({ message: 'Đường dẫn ảnh đại diện phải là chuỗi ký tự.' })
  @IsOptional()
  avatarUrl?: string;

  @IsString({ message: 'Địa chỉ phải là chuỗi ký tự.' })
  @IsOptional()
  address?: string;

  @IsString({ message: 'Phường/Xã phải là chuỗi ký tự.' })
  @IsOptional()
  ward?: string;

  @IsString({ message: 'Quận/Huyện phải là chuỗi ký tự.' })
  @IsOptional()
  district?: string;

  @IsString({ message: 'Tỉnh/Thành phố phải là chuỗi ký tự.' })
  @IsOptional()
  city?: string;

  @IsInt({ message: 'Điểm tích lũy phải là số nguyên.' })
  @Min(0, { message: 'Điểm tích lũy không được nhỏ hơn 0.' })
  @IsOptional()
  loyaltyPoints?: number;

  @IsBoolean({ message: 'Trạng thái hoạt động phải là kiểu Boolean.' })
  @IsOptional()
  isActive?: boolean;
}
