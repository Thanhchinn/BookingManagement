import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class CreateMatchPostDto {
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNotEmpty({ message: 'Vui lòng chọn sân thi đấu' })
  sportsPitchId: string | number;

  @IsOptional()
  bookingId?: string | number;

  @IsString()
  @IsNotEmpty({ message: 'Vui lòng chọn ngày thi đấu' })
  playDate: string; // Định dạng 'YYYY-MM-DD'

  @IsString()
  @IsNotEmpty({ message: 'Vui lòng chọn thời gian bắt đầu' })
  startTime: string; // Định dạng 'HH:MM' hoặc 'HH:MM:SS'

  @IsString()
  @IsNotEmpty({ message: 'Vui lòng chọn thời gian kết thúc' })
  endTime: string; // Định dạng 'HH:MM' hoặc 'HH:MM:SS'

  @IsString()
  @IsOptional()
  skillLevel?: string;

  @IsInt({ message: 'Số lượng tối đa phải là số nguyên' })
  @Min(2, { message: 'Cần tuyển ít nhất 2 cầu thủ' })
  maxPlayers: number;
}
