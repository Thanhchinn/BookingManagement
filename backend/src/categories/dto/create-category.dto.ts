import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class CreateCategoryDto {
  @IsString({ message: 'Tên bộ môn phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên bộ môn không được để trống' })
  name: string;

  @IsString({ message: 'Đường dẫn slug phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Đường dẫn slug không được để trống' })
  slug: string;

  @IsString({ message: 'Icon phải là chuỗi ký tự' })
  @IsOptional()
  icon?: string;

  @IsString({ message: 'Màu nền phải là chuỗi ký tự' })
  @IsOptional()
  colorBg?: string;

  @IsString({ message: 'Màu chữ phải là chuỗi ký tự' })
  @IsOptional()
  colorText?: string;

  @IsBoolean({ message: 'Trạng thái hoạt động phải là kiểu Boolean' })
  @IsOptional()
  isActive?: boolean;

  @IsInt({ message: 'Thứ tự sắp xếp phải là số nguyên' })
  @IsOptional()
  sortOrder?: number;
}
