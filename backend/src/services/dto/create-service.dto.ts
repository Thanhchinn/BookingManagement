import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, IsArray } from 'class-validator';

export class CreateServiceDto {
  @IsNotEmpty({ message: 'ID cơ sở không được để trống' })
  locationId: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên sân không được để trống' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Bộ môn thể thao không được để trống' })
  category: string;

  @IsString()
  @IsOptional()
  subType?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({}, { message: 'Đơn giá thuê mỗi giờ phải là số' })
  @IsNotEmpty({ message: 'Đơn giá thuê mỗi giờ không được để trống' })
  basePricePerHour: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imageUrls?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
