import { IsString, IsNotEmpty, IsArray, IsOptional, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class BookingProductDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  sportsPitchId: string;

  @IsString()
  @IsNotEmpty()
  bookingDate: string;

  @IsString()
  @IsNotEmpty()
  slotId: string;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string; // 'CASH' | 'MOMO' | 'VNPAY' | 'BANK_TRANSFER'

  @IsString()
  @IsNotEmpty()
  paymentOption: string; // 'CASH' | 'FULL' | 'PARTIAL'

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BookingProductDto)
  products?: BookingProductDto[];

  @IsString()
  @IsOptional()
  promoCode?: string;
}
