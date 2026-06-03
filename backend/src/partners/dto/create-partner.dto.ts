import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePartnerDto {
  @IsString()
  @IsNotEmpty({ message: 'User ID không được để trống' })
  userId: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên doanh nghiệp/tổ hợp sân không được để trống' })
  businessName: string;

  @IsString()
  @IsOptional()
  taxCode?: string;

  @IsString()
  @IsOptional()
  businessLicenseUrl?: string;
}
