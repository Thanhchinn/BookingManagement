import { Controller, Get, Post, Patch, Delete, Body, Param, Request } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, QuoteBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { ADMIN_ROLES, USER_ROLE } from '../auth/auth.constants';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // 0. Báo giá / kiểm tra mã khuyến mãi trước khi đặt (không tạo đơn)
  @Post('quote')
  @Roles(USER_ROLE)
  async quoteBooking(@Request() req: any, @Body() body: QuoteBookingDto) {
    return this.bookingsService.quoteBooking(req.user.userId, body);
  }

  // 1. Khách đặt sân mới
  @Post()
  @Roles(USER_ROLE)
  async createBooking(@Request() req: any, @Body() body: CreateBookingDto) {
    return this.bookingsService.createBooking(req.user.userId, body);
  }

  // 2. Khách hàng lấy danh sách đơn đặt lịch của mình
  @Get('my-bookings')
  @Roles(USER_ROLE)
  async getMyBookings(@Request() req: any) {
    return this.bookingsService.getMyBookings(req.user.userId);
  }

  // 3. Chủ sân lấy danh sách đơn đặt của cơ sở mình quản lý
  @Get('partner-bookings')
  @Roles(USER_ROLE)
  async getPartnerBookings(@Request() req: any) {
    return this.bookingsService.getPartnerBookings(req.user.userId);
  }

  // 4. Admin lấy toàn bộ danh sách đơn đặt trong hệ thống
  @Get('admin-all')
  @Roles(...ADMIN_ROLES)
  async getAdminBookings() {
    return this.bookingsService.getAdminBookings();
  }

  // 4.5 Lịch sử thay đổi trạng thái của một đơn (khách đặt, chủ sân hoặc Admin)
  @Get(':id/history')
  async getHistory(@Request() req: any, @Param('id') bookingId: string) {
    return this.bookingsService.getStatusHistory(req.user, bookingId);
  }

  // 5. Khách hàng, Đối tác hoặc Admin cập nhật trạng thái đơn đặt (Phê duyệt, Hủy hoặc Hoàn tiền)
  @Patch(':id/status')
  async updateStatus(
    @Request() req: any,
    @Param('id') bookingId: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatus(req.user, bookingId, dto);
  }

  // 6. Xóa lịch đặt khi đã bị hủy (chỉ dành cho Chủ sân/Đối tác hoặc Admin)
  @Delete(':id')
  async deleteBooking(@Request() req: any, @Param('id') bookingId: string) {
    return this.bookingsService.deleteBooking(req.user, bookingId);
  }
}
