import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Patch, 
  Delete, 
  Query, 
  UseGuards, 
  Request,
  ForbiddenException
} from '@nestjs/common';
import { MatchmakingService } from './matchmaking.service';
import { CreateMatchPostDto } from './dto/create-match-post.dto';
import { ApplyMatchDto } from './dto/apply-match.dto';
import { ApproveParticipantDto } from './dto/approve-participant.dto';
import { ApprovePostDto } from './dto/approve-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('matchmaking')
export class MatchmakingController {
  constructor(private readonly matchmakingService: MatchmakingService) {}

  // 1. Tạo bài viết ghép đôi mới (Khách hàng)
  @Post('posts')
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() dto: CreateMatchPostDto) {
    const userId = req.user.userId;
    return this.matchmakingService.create(userId, dto);
  }

  // 2. Lấy danh sách bài đăng ghép đôi công khai (hiển thị cho tất cả khách hàng)
  @Get('posts/public')
  async findPublic(
    @Query('sport') sport?: string,
    @Query('playDate') playDate?: string,
    @Query('skillLevel') skillLevel?: string,
    @Query('search') search?: string,
  ) {
    return this.matchmakingService.findPublic({ sport, playDate, skillLevel, search });
  }

  // 3. Lấy danh sách bài viết của chính người đăng nhập (My Posts)
  @Get('posts/my-posts')
  @UseGuards(JwtAuthGuard)
  async findMyPosts(@Request() req) {
    const userId = req.user.userId;
    return this.matchmakingService.findMyPosts(userId);
  }

  // 3.5 Lấy danh sách bài đăng ghép đôi người dùng tham gia (Host hoặc đã JOINED)
  @Get('posts/joined')
  @UseGuards(JwtAuthGuard)
  async findJoinedMatches(@Request() req) {
    const userId = req.user.userId;
    return this.matchmakingService.findJoinedMatches(userId);
  }

  // 4. Xem chi tiết bài viết (Khách hàng)
  @Get('posts/:id')
  async findOne(@Param('id') id: string) {
    return this.matchmakingService.findOne(id);
  }

  // 5. Nộp đơn xin gia nhập trận đấu (Khách hàng)
  @Post('posts/:id/apply')
  @UseGuards(JwtAuthGuard)
  async applyToJoin(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: ApplyMatchDto,
  ) {
    const userId = req.user.userId;
    return this.matchmakingService.applyToJoin(userId, id, dto);
  }

  // 6. Host phê duyệt thành viên tham gia
  @Patch('posts/:id/participants/:participantId')
  @UseGuards(JwtAuthGuard)
  async approveParticipant(
    @Request() req,
    @Param('id') id: string,
    @Param('participantId') participantId: string,
    @Body() dto: ApproveParticipantDto,
  ) {
    const userId = req.user.userId;
    return this.matchmakingService.approveParticipant(userId, id, participantId, dto);
  }

  // 6.2 Người tham gia tự hủy/rút lui khỏi trận đấu
  @Post('posts/:id/leave')
  @UseGuards(JwtAuthGuard)
  async leaveMatch(@Request() req, @Param('id') id: string, @Body('reason') reason?: string) {
    const userId = req.user.userId;
    return this.matchmakingService.leaveMatch(userId, id, reason);
  }

  // 6.5 Host xóa/kick thành viên khỏi trận đấu
  @Post('posts/:id/participants/:participantId/kick')
  @UseGuards(JwtAuthGuard)
  async removeParticipant(
    @Request() req,
    @Param('id') id: string,
    @Param('participantId') participantId: string,
    @Body('reason') reason?: string,
  ) {
    const userId = req.user.userId;
    return this.matchmakingService.removeParticipant(userId, id, participantId, reason);
  }

  // 7. Host hủy/xóa bài đăng hoặc Admin xóa bài đăng
  @Delete('posts/:id')
  @UseGuards(JwtAuthGuard)
  async remove(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    const role = req.user.role;
    return this.matchmakingService.remove(userId, id, role);
  }

  // ==========================================================================
  // PHẦN ADMIN: DUYỆT & QUẢN LÝ BÀI ĐĂNG TOÀN HỆ THỐNG
  // ==========================================================================

  // Admin lấy danh sách các bài đăng trong hệ thống
  @Get('admin/posts')
  @UseGuards(JwtAuthGuard)
  async adminFindAll(
    @Request() req,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    // Bảo mật: check role admin
    if (req.user.role === 'USER') {
      throw new ForbiddenException('Bạn không có quyền thực hiện hành động này.');
    }

    return this.matchmakingService.adminFindAll({
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }

  // Admin duyệt bài viết của người dùng
  @Patch('admin/posts/:id/approve')
  @UseGuards(JwtAuthGuard)
  async adminApprove(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: ApprovePostDto,
  ) {
    // Bảo mật: check role admin
    if (req.user.role === 'USER') {
      throw new ForbiddenException('Bạn không có quyền thực hiện hành động này.');
    }

    return this.matchmakingService.adminApprove(id, dto);
  }
}
