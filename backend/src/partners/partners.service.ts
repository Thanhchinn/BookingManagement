import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CommissionType, LedgerEntryType, PartnerProfile, PartnerStatus, Prisma } from '@prisma/client';
import { postLedgerEntry } from './partner-ledger';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { CreateLedgerEntryDto, UpdatePartnerDto } from './dto/update-partner.dto';

@Injectable()
export class PartnersService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy tất cả hồ sơ Đối tác (Chủ sân)
  async findAll(): Promise<PartnerProfile[]> {
    return this.prisma.partnerProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Lấy chi tiết hồ sơ đối tác
  async findOne(id: string | number | bigint): Promise<PartnerProfile> {
    const partner = await this.prisma.partnerProfile.findUnique({
      where: { id: BigInt(id) },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
    });
    if (!partner) {
      throw new NotFoundException(`Không tìm thấy hồ sơ đối tác có ID: ${id}`);
    }
    return partner;
  }

  // Lấy hồ sơ đối tác theo User ID — trả null nếu chưa đăng ký (không throw lỗi)
  async findByUserId(userId: string | number | bigint): Promise<PartnerProfile | null> {
    return this.prisma.partnerProfile.findUnique({
      where: { userId: BigInt(userId) },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  // Lấy Profile đối tác từ User ID — ném lỗi NotFound nếu không tồn tại
  async getPartnerProfileOrThrow(userId: string | number | bigint): Promise<PartnerProfile> {
    const partner = await this.prisma.partnerProfile.findUnique({
      where: { userId: BigInt(userId) },
    });
    if (!partner) {
      throw new NotFoundException('Không tìm thấy thông tin đối tác của tài khoản này.');
    }
    return partner;
  }

  // Tạo/Đăng ký hồ sơ đối tác mới
  async create(userId: string | number | bigint, data: CreatePartnerDto): Promise<PartnerProfile> {
    // Kiểm tra xem User ID này đã đăng ký đối tác chưa
    const existing = await this.prisma.partnerProfile.findUnique({
      where: { userId: BigInt(userId) },
    });
    if (existing) {
      throw new ConflictException('Tài khoản người dùng này đã có hồ sơ đối tác đang được xử lý hoặc đã hoạt động.');
    }

    return this.prisma.partnerProfile.create({
      data: {
        userId: BigInt(userId),
        businessName: data.businessName,
        taxCode: data.taxCode ?? null,
        businessLicenseUrl: data.businessLicenseUrl ?? null,
        commissionRate: 10.00,
        balance: 0.00,
        status: 'PENDING',
      },
    });
  }

  // Duyệt/Cập nhật trạng thái hồ sơ đối tác (Admin duyệt)
  async updateStatus(
    id: string | number | bigint,
    status: string,
    approvedByAdminId?: string | number | bigint,
  ): Promise<PartnerProfile> {
    await this.findOne(id); // Check existence

    return this.prisma.partnerProfile.update({
      where: { id: BigInt(id) },
      data: {
        status: status as PartnerStatus,
        approvedBy: approvedByAdminId ? BigInt(approvedByAdminId) : null,
      },
    });
  }

  // Cập nhật thông tin đối tác
  async update(id: string | number | bigint, data: UpdatePartnerDto): Promise<PartnerProfile> {
    await this.findOne(id);

    return this.prisma.partnerProfile.update({
      where: { id: BigInt(id) },
      data: {
        businessName: data.businessName,
        taxCode: data.taxCode,
        businessLicenseUrl: data.businessLicenseUrl,
        commissionRate: data.commissionRate,
        commissionType: data.commissionType as CommissionType | undefined,
        commissionFixedAmount: data.commissionFixedAmount,
        bankName: data.bankName,
        bankAccountNumber: data.bankAccountNumber,
        bankAccountName: data.bankAccountName,
      },
    });
  }

  // Sổ cái hoa hồng của đối tác (mới nhất trước)
  async getLedger(id: string | number | bigint, limit = 100) {
    const partner = await this.findOne(id);
    const entries = await this.prisma.partnerLedgerEntry.findMany({
      where: { partnerId: partner.id },
      include: { booking: { select: { bookingCode: true } } },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: Math.min(Math.max(limit, 1), 500),
    });
    return { balance: partner.balance, entries };
  }

  // Admin ghi nhận đối tác thanh toán hoa hồng hoặc điều chỉnh thủ công
  async recordLedgerEntry(id: string | number | bigint, dto: CreateLedgerEntryDto, adminId: string) {
    const partner = await this.findOne(id);
    if (dto.type === 'COMMISSION_PAYMENT' && dto.amount < 0) {
      throw new BadRequestException('Số tiền thanh toán phải lớn hơn 0.');
    }
    // Thanh toán làm giảm số tiền đối tác đang nợ
    const amount = new Prisma.Decimal(dto.type === 'COMMISSION_PAYMENT' ? -dto.amount : dto.amount);
    return this.prisma.$transaction((tx) =>
      postLedgerEntry(tx, {
        partnerId: partner.id,
        type: dto.type as LedgerEntryType,
        amount,
        note: dto.note ?? null,
        createdBy: BigInt(adminId),
      }),
    );
  }

  // Xóa hồ sơ đối tác
  async remove(id: string | number | bigint): Promise<{ message: string }> {
    await this.findOne(id);
    const partnerId = BigInt(id);

    // Chỉ xóa hẳn hồ sơ chưa phát sinh dữ liệu (ví dụ: từ chối hồ sơ đăng ký).
    // Đối tác đã có cơ sở/khuyến mãi/hóa đơn/khiếu nại thì phải dùng chức năng Khóa (SUSPENDED) để giữ lịch sử.
    const [locations, promotions, bills, disputes, ledger] = await Promise.all([
      this.prisma.location.count({ where: { partnerId } }),
      this.prisma.promotion.count({ where: { partnerId } }),
      this.prisma.partnerCommissionBill.count({ where: { partnerId } }),
      this.prisma.dispute.count({ where: { againstPartner: partnerId } }),
      this.prisma.partnerLedgerEntry.count({ where: { partnerId } }),
    ]);
    if (locations + promotions + bills + disputes + ledger > 0) {
      throw new ConflictException(
        'Đối tác đã có cơ sở hoặc dữ liệu giao dịch nên không thể xóa. Hãy dùng chức năng Khóa tài khoản đối tác.',
      );
    }

    await this.prisma.partnerProfile.delete({
      where: { id: partnerId },
    });
    return { message: `Đã xóa thành công hồ sơ đối tác có ID: ${id}` };
  }
}
