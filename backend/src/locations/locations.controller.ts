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
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('locations')
@UseGuards(JwtAuthGuard)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  // Lấy toàn bộ tiện ích hệ thống (không lọc theo partner)
  @Get('amenities')
  async getSystemAmenities() {
    return this.locationsService.getSystemAmenities();
  }

  // Lấy toàn bộ cơ sở của đối tác đang đăng nhập
  @Get()
  async findAll(@Request() req: any) {
    const userId = req.user.userId;
    return this.locationsService.findAll(userId);
  }

  // Lấy chi tiết cơ sở của đối tác đang đăng nhập
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.userId;
    return this.locationsService.findOne(id, userId);
  }

  // Tạo mới một cơ sở
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createLocationDto: CreateLocationDto, @Request() req: any) {
    const userId = req.user.userId;
    return this.locationsService.create(createLocationDto, userId);
  }

  // Cập nhật cơ sở
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    return this.locationsService.update(id, updateLocationDto, userId);
  }

  // Xóa cơ sở
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.userId;
    return this.locationsService.remove(id, userId);
  }
}
