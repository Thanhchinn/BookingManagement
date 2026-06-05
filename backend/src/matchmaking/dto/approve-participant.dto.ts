import { IsIn } from 'class-validator';

export class ApproveParticipantDto {
  @IsIn(['JOINED', 'REJECTED'], { message: 'Trạng thái phê duyệt phải là JOINED hoặc REJECTED' })
  status: 'JOINED' | 'REJECTED';
}
