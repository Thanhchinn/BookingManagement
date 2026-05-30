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
  HttpStatus 
} from '@nestjs/common';
import { PartnersService } from './partners.service';

// Hàm helper để convert BigInt thành string trong JSON response
function serializePartner(partner: any) {
  if (!partner) return null;
  return {
    ...partner,
    id: partner.id.toString(),
    userId: partner.userId.toString(),
    approvedBy: partner.approvedBy ? partner.approvedBy.toString() : null,
    commissionRate: partner.commissionRate ? parseFloat(partner.commissionRate.toString()) : null,
    balance: partner.balance ? parseFloat(partner.balance.toString()) : null,
    user: partner.user ? {
      ...partner.user,
      id: partner.user.id.toString(),
    } : undefined,
  };
}

@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Get()
  async findAll() {
    const partners = await this.partnersService.findAll();
    return partners.map(serializePartner);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const partner = await this.partnersService.findOne(id);
    return serializePartner(partner);
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    const partner = await this.partnersService.findByUserId(userId);
    return serializePartner(partner);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPartnerDto: any) {
    const newPartner = await this.partnersService.create(createPartnerDto);
    return serializePartner(newPartner);
  }

  // Duyệt hồ sơ Đối tác
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string, 
    @Body('status') status: string,
    @Body('approvedByAdminId') approvedByAdminId?: string
  ) {
    const updated = await this.partnersService.updateStatus(id, status, approvedByAdminId);
    return serializePartner(updated);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePartnerDto: any) {
    const updated = await this.partnersService.update(id, updatePartnerDto);
    return serializePartner(updated);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.partnersService.remove(id);
  }
}
