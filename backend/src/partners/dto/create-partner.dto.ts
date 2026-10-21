import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

// userId KHÔNG nhận từ client — luôn lấy từ token của người đăng nhập
export class CreatePartnerDto {
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
