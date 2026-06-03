import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PartnersService } from './partners.service';
import { CreatePartnerDto } from './dto/create-partner.dto';

// Hàm helper để convert BigInt thành string trong JSON response
function serializePartner(partner: any) {
  if (!partner) return null;
  return {
    ...partner,
    id: partner.id?.toString(),
    userId: partner.userId?.toString(),
    approvedBy: partner.approvedBy ? partner.approvedBy.toString() : null,
    commissionRate: partner.commissionRate
      ? parseFloat(partner.commissionRate.toString())
      : null,
    balance: partner.balance ? parseFloat(partner.balance.toString()) : null,
    user: partner.user
      ? {
          ...partner.user,
          id: partner.user.id?.toString(),
        }
      : undefined,
  };
}

@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  // Lấy danh sách tất cả đối tác (Admin)
  @Get()
  async findAll() {
    const partners = await this.partnersService.findAll();
    return partners.map(serializePartner);
  }

  // Kiểm tra hồ sơ đối tác theo User ID — trả null nếu chưa đăng ký (không throw 404)
  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    const partner = await this.partnersService.findByUserId(userId);
    return partner ? serializePartner(partner) : null;
  }

  // Lấy chi tiết 1 đối tác theo ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const partner = await this.partnersService.findOne(id);
    return serializePartner(partner);
  }

  // Đăng ký hồ sơ đối tác mới
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPartnerDto: CreatePartnerDto) {
    const newPartner = await this.partnersService.create(createPartnerDto);
    return serializePartner(newPartner);
  }

  // Cập nhật trạng thái hồ sơ (Admin phê duyệt / từ chối)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('approvedByAdminId') approvedByAdminId?: string,
  ) {
    const updated = await this.partnersService.updateStatus(
      id,
      status,
      approvedByAdminId,
    );
    return serializePartner(updated);
  }

  // Cập nhật thông tin đối tác
  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePartnerDto: any) {
    const updated = await this.partnersService.update(id, updatePartnerDto);
    return serializePartner(updated);
  }

  // Xóa hồ sơ đối tác
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.partnersService.remove(id);
  }
}
