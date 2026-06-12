import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // 1. Khách đặt sân mới
  @Post()
  async createBooking(@Request() req: any, @Body() body: CreateBookingDto) {
    return this.bookingsService.createBooking(req.user.userId, body);
  }

  // 2. Khách hàng lấy danh sách đơn đặt lịch của mình
  @Get('my-bookings')
  async getMyBookings(@Request() req: any) {
    return this.bookingsService.getMyBookings(req.user.userId);
  }

  // 3. Chủ sân lấy danh sách đơn đặt của cơ sở mình quản lý
  @Get('partner-bookings')
  async getPartnerBookings(@Request() req: any) {
    return this.bookingsService.getPartnerBookings(req.user.userId);
  }

  // 4. Admin lấy toàn bộ danh sách đơn đặt trong hệ thống
  @Get('admin-all')
  async getAdminBookings(@Request() req: any) {
    return this.bookingsService.getAdminBookings(req.user.userId);
  }

  // 5. Khách hàng, Đối tác hoặc Admin cập nhật trạng thái đơn đặt (Phê duyệt, Hủy hoặc Hoàn tiền)
  @Patch(':id/status')
  async updateStatus(
    @Request() req: any,
    @Param('id') bookingId: string,
    @Body('status') status?: string,
    @Body('paymentStatus') paymentStatus?: string,
    @Body('cancellationReason') cancellationReason?: string,
  ) {
    return this.bookingsService.updateStatus(
      req.user.userId,
      bookingId,
      status,
      paymentStatus,
      cancellationReason,
    );
  }

  // 6. Xóa lịch đặt khi đã bị hủy (chỉ dành cho Chủ sân/Đối tác hoặc Admin)
  @Delete(':id')
  async deleteBooking(@Request() req: any, @Param('id') bookingId: string) {
    return this.bookingsService.deleteBooking(req.user.userId, bookingId);
  }
}
