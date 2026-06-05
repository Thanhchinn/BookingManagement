import { IsIn } from 'class-validator';

export class ApprovePostDto {
  @IsIn(['OPEN', 'REJECTED'], { message: 'Trạng thái duyệt bài đăng phải là OPEN hoặc REJECTED' })
  status: 'OPEN' | 'REJECTED';
}
