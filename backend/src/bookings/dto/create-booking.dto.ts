import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsInt,
  IsIn,
  Min,
  Max,
  Matches,
  ArrayMaxSize,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

// Chỉ hỗ trợ các phương thức thanh toán đã có luồng xử lý thật.
// MOMO/VNPAY sẽ được thêm khi tích hợp cổng thanh toán (cần xác thực callback/IPN).
export const PAYMENT_METHODS = ['CASH', 'BANK_TRANSFER'] as const;
export const PAYMENT_OPTIONS = ['CASH', 'FULL', 'PARTIAL'] as const;

class BookingProductDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt({ message: 'Số lượng sản phẩm phải là số nguyên.' })
  @Min(1)
  @Max(50, { message: 'Mỗi sản phẩm chỉ được đặt tối đa 50.' })
  quantity: number;
}

// Thông tin dùng chung cho báo giá và tạo đơn
export class QuoteBookingDto {
  @IsString()
  @IsNotEmpty()
  sportsPitchId: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Ngày đặt sân phải có định dạng YYYY-MM-DD.' })
  bookingDate: string;

  @IsString()
  @IsNotEmpty()
  slotId: string; // Định dạng "<timeSlotId>_<thời lượng giờ>", ví dụ "12_1.5"

  @IsArray()
  @IsOptional()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => BookingProductDto)
  products?: BookingProductDto[];

  @IsString()
  @IsOptional()
  @MaxLength(50)
  promoCode?: string;
}

export class CreateBookingDto extends QuoteBookingDto {
  @IsIn(PAYMENT_METHODS, { message: 'Phương thức thanh toán không được hỗ trợ.' })
  paymentMethod: string;

  @IsIn(PAYMENT_OPTIONS, { message: 'Hình thức thanh toán không hợp lệ.' })
  paymentOption: string;
}
