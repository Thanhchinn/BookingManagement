import { IsIn, IsNumber, IsOptional, IsString, Max, MaxLength, Min, NotEquals } from 'class-validator';

export const PARTNER_STATUSES = ['PENDING', 'ACTIVE', 'SUSPENDED'] as const;

export class UpdatePartnerStatusDto {
  @IsIn(PARTNER_STATUSES, { message: 'Trạng thái đối tác không hợp lệ.' })
  status: string;
}

export class UpdatePartnerDto {
  @IsString()
  @IsOptional()
  businessName?: string;

  @IsString()
  @IsOptional()
  taxCode?: string;

  @IsString()
  @IsOptional()
  businessLicenseUrl?: string;

  @IsString()
  @IsOptional()
  bankName?: string;

  @IsString()
  @IsOptional()
  bankAccountNumber?: string;

  @IsString()
  @IsOptional()
  bankAccountName?: string;

  // Các trường hoa hồng chỉ Admin được phép thay đổi (controller sẽ loại bỏ với đối tác)
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  commissionRate?: number;

  @IsIn(['PERCENTAGE', 'FIXED_AMOUNT'])
  @IsOptional()
  commissionType?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  commissionFixedAmount?: number;
}

// Admin ghi nhận bút toán thủ công vào sổ cái hoa hồng
export class CreateLedgerEntryDto {
  @IsIn(['COMMISSION_PAYMENT', 'ADJUSTMENT'], { message: 'Loại bút toán không hợp lệ.' })
  type: 'COMMISSION_PAYMENT' | 'ADJUSTMENT';

  // COMMISSION_PAYMENT: số tiền đối tác đã trả (> 0). ADJUSTMENT: dương = tăng nợ, âm = giảm nợ.
  @IsNumber()
  @NotEquals(0, { message: 'Số tiền phải khác 0.' })
  amount: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  note?: string;
}
