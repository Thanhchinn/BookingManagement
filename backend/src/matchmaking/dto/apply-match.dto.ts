import { IsString, IsOptional } from 'class-validator';

export class ApplyMatchDto {
  @IsString()
  @IsOptional()
  note?: string;
}
