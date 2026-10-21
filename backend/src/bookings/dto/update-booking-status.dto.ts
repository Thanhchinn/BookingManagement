import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export const BOOKING_STATUSES = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const;
export const PAYMENT_STATUSES = ['UNPAID', 'PARTIALLY_PAID', 'PAID', 'REFUNDED'] as const;

export class UpdateBookingStatusDto {
  @IsIn(BOOKING_STATUSES, { message: 'Trạng thái đơn đặt sân không hợp lệ.' })
  @IsOptional()
  status?: string;

  @IsIn(PAYMENT_STATUSES, { message: 'Trạng thái thanh toán không hợp lệ.' })
  @IsOptional()
  paymentStatus?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  cancellationReason?: string;
}
