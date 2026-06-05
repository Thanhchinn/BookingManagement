import { 
  IsEmail, 
  IsString, 
  MinLength, 
  IsOptional, 
  IsBoolean, 
  IsInt, 
  Min 
} from 'class-validator';

export class UpdateUserDto {
  @IsString({ message: 'Họ và tên phải là chuỗi ký tự.' })
  @IsOptional()
  @MinLength(2, { message: 'Họ và tên phải có ít nhất 2 ký tự.' })
  fullName?: string;

  @IsEmail({}, { message: 'Định dạng email không hợp lệ.' })
  @IsOptional()
  email?: string;

  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự.' })
  @IsOptional()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự.' })
  password?: string;

  @IsString({ message: 'Mật khẩu hiện tại phải là chuỗi ký tự.' })
  @IsOptional()
  currentPassword?: string;

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

  @IsString({ message: 'Ngày sinh phải là chuỗi định dạng ngày.' })
  @IsOptional()
  birthDate?: string;

  @IsString({ message: 'Giới tính phải là chuỗi ký tự.' })
  @IsOptional()
  gender?: string;

  @IsString({ message: 'Tiểu sử phải là chuỗi ký tự.' })
  @IsOptional()
  bio?: string;

  @IsOptional()
  favoriteSports?: any;

  @IsOptional()
  skillLevels?: any;

  @IsOptional()
  preferredPlayTime?: any;
}
