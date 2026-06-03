import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PartnerProfile } from '@prisma/client';
import { CreatePartnerDto } from './dto/create-partner.dto';

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

  // Tạo/Đăng ký hồ sơ đối tác mới
  async create(data: CreatePartnerDto): Promise<PartnerProfile> {
    // Kiểm tra xem User ID này đã đăng ký đối tác chưa
    const existing = await this.prisma.partnerProfile.findUnique({
      where: { userId: BigInt(data.userId) },
    });
    if (existing) {
      throw new ConflictException('Tài khoản người dùng này đã có hồ sơ đối tác đang được xử lý hoặc đã hoạt động.');
    }

    return this.prisma.partnerProfile.create({
      data: {
        userId: BigInt(data.userId),
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
        status,
        approvedBy: approvedByAdminId ? BigInt(approvedByAdminId) : null,
      },
    });
  }

  // Cập nhật thông tin đối tác
  async update(id: string | number | bigint, data: any): Promise<PartnerProfile> {
    await this.findOne(id);

    return this.prisma.partnerProfile.update({
      where: { id: BigInt(id) },
      data: {
        businessName: data.businessName,
        taxCode: data.taxCode,
        businessLicenseUrl: data.businessLicenseUrl,
        commissionRate: data.commissionRate,
      },
    });
  }

  // Xóa hồ sơ đối tác
  async remove(id: string | number | bigint): Promise<{ message: string }> {
    await this.findOne(id);
    await this.prisma.partnerProfile.delete({
      where: { id: BigInt(id) },
    });
    return { message: `Đã xóa thành công hồ sơ đối tác có ID: ${id}` };
  }
}
