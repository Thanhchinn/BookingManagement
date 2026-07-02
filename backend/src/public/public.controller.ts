import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { PublicService } from './public.service';

// Controller này KHÔNG có @UseGuards(JwtAuthGuard) — công khai cho mọi người
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  // Lấy danh sách cơ sở (trang tìm kiếm + trang chủ)
  // GET /public/locations?city=TP.HCM&category=Bóng đá&search=SportZone
  @Get('locations')
  async findLocations(
    @Query('city') city?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.publicService.findLocations(city, category, search);
  }

  // Lấy danh sách tất cả sân đấu nổi bật
  // GET /public/sports-pitches
  @Get('sports-pitches')
  async findSportsPitches() {
    return this.publicService.findSportsPitches();
  }

  // Lấy chi tiết 1 cơ sở (trang CourtDetails)
  // GET /public/locations/:id
  @Get('locations/:id')
  async findLocationById(@Param('id') id: string) {
    return this.publicService.findLocationById(id);
  }

  // Lấy chi tiết 1 sân (kèm timeslots + reviews)
  // GET /public/services/:id
  @Get('services/:id')
  async findServiceById(@Param('id') id: string) {
    return this.publicService.findServiceById(id);
  }

  // Lấy slot khả dụng của sân theo ngày
  // GET /public/services/:id/available-slots?date=2026-06-10&duration=1.5
  @Get('services/:id/available-slots')
  async getAvailableSlots(
    @Param('id') id: string,
    @Query('date') date: string,
    @Query('duration') duration?: string,
  ) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const parsedDuration = duration ? parseFloat(duration) : undefined;
    return this.publicService.getAvailableSlots(id, targetDate, parsedDuration);
  }

  // Lấy sản phẩm bán kèm của cơ sở
  // GET /public/products/location/:locationId
  @Get('products/location/:locationId')
  async getProductsByLocation(@Param('locationId') locationId: string) {
    return this.publicService.getProductsByLocation(locationId);
  }
}
