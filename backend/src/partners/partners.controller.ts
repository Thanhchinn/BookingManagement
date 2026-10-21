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
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { PartnersService } from './partners.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { CreateLedgerEntryDto, UpdatePartnerDto, UpdatePartnerStatusDto } from './dto/update-partner.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { ADMIN_ROLES, AuthUser, isAdminRole, USER_ROLE } from '../auth/auth.constants';

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
    commissionFixedAmount: partner.commissionFixedAmount
      ? parseFloat(partner.commissionFixedAmount.toString())
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

// Chỉ Admin hoặc chính chủ tài khoản người dùng sở hữu hồ sơ mới được truy cập
function assertAdminOrOwner(user: AuthUser, ownerUserId: string | bigint) {
  if (isAdminRole(user.role)) return;
  if (user.role === USER_ROLE && user.userId === ownerUserId.toString()) return;
  throw new ForbiddenException('Bạn không có quyền truy cập hồ sơ đối tác này.');
}

@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  // Lấy danh sách tất cả đối tác (Admin)
  @Get()
  @Roles(...ADMIN_ROLES)
  async findAll() {
    const partners = await this.partnersService.findAll();
    return partners.map(serializePartner);
  }

  // Kiểm tra hồ sơ đối tác theo User ID — trả null nếu chưa đăng ký (không throw 404)
  @Get('user/:userId')
  async findByUserId(@Request() req: any, @Param('userId') userId: string) {
    assertAdminOrOwner(req.user, userId);
    const partner = await this.partnersService.findByUserId(userId);
    return partner ? serializePartner(partner) : null;
  }

  // Lấy chi tiết 1 đối tác theo ID
  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    const partner = await this.partnersService.findOne(id);
    assertAdminOrOwner(req.user, partner.userId);
    return serializePartner(partner);
  }

  // Đăng ký hồ sơ đối tác mới cho chính tài khoản đang đăng nhập
  @Post()
  @Roles(USER_ROLE)
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req: any, @Body() createPartnerDto: CreatePartnerDto) {
    const newPartner = await this.partnersService.create(req.user.userId, createPartnerDto);
    return serializePartner(newPartner);
  }

  // Cập nhật trạng thái hồ sơ (Admin phê duyệt / từ chối)
  @Patch(':id/status')
  @Roles(...ADMIN_ROLES)
  async updateStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdatePartnerStatusDto,
  ) {
    // Người phê duyệt luôn là admin đang đăng nhập, không nhận từ body
    const updated = await this.partnersService.updateStatus(id, dto.status, req.user.userId);
    return serializePartner(updated);
  }

  // Cập nhật thông tin đối tác (Admin: toàn bộ; Đối tác: thông tin doanh nghiệp & ngân hàng)
  @Put(':id')
  async update(@Request() req: any, @Param('id') id: string, @Body() updatePartnerDto: UpdatePartnerDto) {
    const partner = await this.partnersService.findOne(id);
    assertAdminOrOwner(req.user, partner.userId);

    const data = { ...updatePartnerDto };
    if (!isAdminRole(req.user.role)) {
      delete data.commissionRate;
      delete data.commissionType;
      delete data.commissionFixedAmount;
    }

    const updated = await this.partnersService.update(id, data);
    return serializePartner(updated);
  }

  // Sổ cái hoa hồng (Admin hoặc chính đối tác)
  @Get(':id/ledger')
  async getLedger(@Request() req: any, @Param('id') id: string) {
    const partner = await this.partnersService.findOne(id);
    assertAdminOrOwner(req.user, partner.userId);
    const { balance, entries } = await this.partnersService.getLedger(id);
    return {
      balance: Number(balance),
      entries: entries.map((e) => ({
        id: e.id.toString(),
        type: e.type,
        amount: Number(e.amount),
        bookingId: e.bookingId?.toString() ?? null,
        bookingCode: e.booking?.bookingCode ?? null,
        note: e.note,
        createdAt: e.createdAt,
      })),
    };
  }

  // Admin ghi nhận đối tác đã thanh toán hoa hồng / điều chỉnh
  @Post(':id/ledger')
  @Roles(...ADMIN_ROLES)
  async recordLedgerEntry(@Request() req: any, @Param('id') id: string, @Body() dto: CreateLedgerEntryDto) {
    return this.partnersService.recordLedgerEntry(id, dto, req.user.userId);
  }

  // Xóa hồ sơ đối tác (Admin)
  @Delete(':id')
  @Roles(...ADMIN_ROLES)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.partnersService.remove(id);
  }
}
