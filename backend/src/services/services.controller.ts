import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('services')
@UseGuards(JwtAuthGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // Lấy danh sách toàn bộ sân của đối tác đang đăng nhập
  @Get('partner')
  async findAll(@Request() req: any) {
    const userId = req.user.userId;
    return this.servicesService.findAll(userId);
  }

  // Lấy chi tiết một sân (kèm khung giờ & đánh giá)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.userId;
    return this.servicesService.findOne(id, userId);
  }

  // Tạo mới một sân
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createServiceDto: CreateServiceDto, @Request() req: any) {
    const userId = req.user.userId;
    return this.servicesService.create(createServiceDto, userId);
  }

  // Cập nhật thông tin sân
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    return this.servicesService.update(id, updateServiceDto, userId);
  }

  // Xóa sân
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.userId;
    return this.servicesService.remove(id, userId);
  }

  // Phản hồi đánh giá của khách hàng
  @Post('reviews/:reviewId/reply')
  @HttpCode(HttpStatus.OK)
  async replyToReview(
    @Param('reviewId') reviewId: string,
    @Body('replyText') replyText: string,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    return this.servicesService.replyToReview(reviewId, replyText, userId);
  }

  // Cấu hình hàng loạt khung giờ hoạt động & bảng giá của sân
  @Post(':id/timeslots')
  @HttpCode(HttpStatus.OK)
  async saveTimeSlots(
    @Param('id') id: string,
    @Body('timeSlots') timeSlots: any[],
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    return this.servicesService.saveTimeSlots(id, timeSlots, userId);
  }
}
