import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

export function serializeService(service: any) {
  if (!service) return null;
  return {
    ...service,
    id: service.id.toString(),
    locationId: service.locationId.toString(),
    basePricePerHour: parseFloat(service.basePricePerHour.toString()),
    location: service.location ? {
      ...service.location,
      id: service.location.id.toString(),
      partnerId: service.location.partnerId?.toString(),
    } : undefined,
    reviews: service.reviews?.map((r: any) => ({
      ...r,
      id: r.id.toString(),
      bookingId: r.bookingId.toString(),
      userId: r.userId.toString(),
      serviceId: r.serviceId.toString(),
      user: r.user ? {
        fullName: r.user.fullName,
        avatarUrl: r.user.avatarUrl,
      } : undefined,
    })) || [],
    timeSlots: service.timeSlots?.map((t: any) => ({
      ...t,
      id: t.id.toString(),
      serviceId: t.serviceId.toString(),
      priceModifier: parseFloat(t.priceModifier.toString()),
    })) || [],
  };
}

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy Profile đối tác từ User ID
  private async getPartnerProfile(userId: string | number | bigint) {
    const partner = await this.prisma.partnerProfile.findUnique({
      where: { userId: BigInt(userId) },
    });
    if (!partner) {
      throw new NotFoundException('Không tìm thấy thông tin đối tác của tài khoản này.');
    }
    return partner;
  }

  // Lấy danh sách sân của đối tác (kèm thông tin địa điểm và số lượng)
  async findAll(userId: string | number | bigint) {
    const partner = await this.getPartnerProfile(userId);
    const services = await this.prisma.service.findMany({
      where: {
        location: {
          partnerId: partner.id,
        },
      },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
          },
        },
        _count: {
          select: {
            timeSlots: true,
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return services.map(serializeService);
  }

  // Lấy chi tiết sân (bao gồm cấu hình khung giờ và các đánh giá từ khách)
  async findOne(id: string | number | bigint, userId: string | number | bigint) {
    const partner = await this.getPartnerProfile(userId);
    const service = await this.prisma.service.findFirst({
      where: {
        id: BigInt(id),
        location: {
          partnerId: partner.id,
        },
      },
      include: {
        location: true,
        timeSlots: {
          orderBy: [
            { dayOfWeek: 'asc' },
            { startTime: 'asc' },
          ],
        },
        reviews: {
          include: {
            user: {
              select: {
                fullName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!service) {
      throw new NotFoundException(`Không tìm thấy sân có ID: ${id}`);
    }
    return serializeService(service);
  }

  // Tạo sân mới dưới một cơ sở của đối tác
  async create(dto: CreateServiceDto, userId: string | number | bigint) {
    const partner = await this.getPartnerProfile(userId);

    // Xác minh cơ sở thuộc sở hữu của đối tác
    const location = await this.prisma.location.findFirst({
      where: {
        id: BigInt(dto.locationId),
        partnerId: partner.id,
      },
    });
    if (!location) {
      throw new ForbiddenException('Bạn không có quyền thêm sân vào cơ sở này.');
    }

    const newService = await this.prisma.service.create({
      data: {
        locationId: BigInt(dto.locationId),
        name: dto.name,
        category: dto.category,
        subType: dto.subType || null,
        description: dto.description || null,
        basePricePerHour: dto.basePricePerHour,
        imageUrls: dto.imageUrls ? JSON.parse(JSON.stringify(dto.imageUrls)) : null,
        isActive: dto.isActive ?? true,
      },
      include: {
        location: true,
      },
    });

    return serializeService(newService);
  }

  // Cập nhật thông tin sân
  async update(id: string | number | bigint, dto: UpdateServiceDto, userId: string | number | bigint) {
    const partner = await this.getPartnerProfile(userId);

    // Xác minh sân thuộc sở hữu của đối tác
    const service = await this.prisma.service.findFirst({
      where: {
        id: BigInt(id),
        location: {
          partnerId: partner.id,
        },
      },
    });
    if (!service) {
      throw new NotFoundException(`Không tìm thấy sân cần chỉnh sửa.`);
    }

    // Nếu cập nhật cơ sở mới, kiểm tra quyền sở hữu đối với cơ sở mới đó
    if (dto.locationId) {
      const targetLocation = await this.prisma.location.findFirst({
        where: {
          id: BigInt(dto.locationId),
          partnerId: partner.id,
        },
      });
      if (!targetLocation) {
        throw new ForbiddenException('Bạn không có quyền chuyển sân sang cơ sở này.');
      }
    }

    const updated = await this.prisma.service.update({
      where: { id: BigInt(id) },
      data: {
        locationId: dto.locationId ? BigInt(dto.locationId) : undefined,
        name: dto.name,
        category: dto.category,
        subType: dto.subType,
        description: dto.description,
        basePricePerHour: dto.basePricePerHour,
        imageUrls: dto.imageUrls ? JSON.parse(JSON.stringify(dto.imageUrls)) : undefined,
        isActive: dto.isActive,
      },
      include: {
        location: true,
      },
    });

    return serializeService(updated);
  }

  // Xóa sân
  async remove(id: string | number | bigint, userId: string | number | bigint) {
    const partner = await this.getPartnerProfile(userId);
    const service = await this.prisma.service.findFirst({
      where: {
        id: BigInt(id),
        location: {
          partnerId: partner.id,
        },
      },
    });
    if (!service) {
      throw new NotFoundException(`Không tìm thấy sân có ID: ${id}`);
    }

    await this.prisma.service.delete({
      where: { id: BigInt(id) },
    });
    return { message: 'Đã xóa sân thành công.' };
  }

  // Trả lời đánh giá sân
  async replyToReview(reviewId: string, replyText: string, userId: string | number | bigint) {
    const partner = await this.getPartnerProfile(userId);
    const review = await this.prisma.review.findFirst({
      where: {
        id: BigInt(reviewId),
        service: {
          location: {
            partnerId: partner.id,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Không tìm thấy đánh giá này hoặc đánh giá không thuộc sân của bạn.');
    }

    const updatedReview = await this.prisma.review.update({
      where: { id: BigInt(reviewId) },
      data: {
        partnerReply: replyText,
      },
      include: {
        user: {
          select: {
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return {
      ...updatedReview,
      id: updatedReview.id.toString(),
      bookingId: updatedReview.bookingId.toString(),
      userId: updatedReview.userId.toString(),
      serviceId: updatedReview.serviceId.toString(),
    };
  }

  // Cấu hình hàng loạt khung giờ & giá của sân
  async saveTimeSlots(serviceId: string | number | bigint, timeSlots: any[], userId: string | number | bigint) {
    const partner = await this.getPartnerProfile(userId);
    const service = await this.prisma.service.findFirst({
      where: {
        id: BigInt(serviceId),
        location: {
          partnerId: partner.id,
        },
      },
    });
    if (!service) {
      throw new NotFoundException('Không tìm thấy sân có ID này hoặc không thuộc quyền sở hữu của bạn.');
    }

    // Xóa tất cả khung giờ cũ của sân này
    await this.prisma.timeSlot.deleteMany({
      where: { serviceId: BigInt(serviceId) },
    });

    // Thêm các khung giờ mới
    const createdSlots = await Promise.all(
      timeSlots.map(async (slot) => {
        const parseTime = (tStr: string) => {
          const [h, m] = tStr.split(':');
          // Tạo đối tượng Date chứa giờ phút phù hợp, timezone UTC/Local để lưu vào DB PostgreSQL Time
          const d = new Date();
          d.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
          return d;
        };

        return this.prisma.timeSlot.create({
          data: {
            serviceId: BigInt(serviceId),
            dayOfWeek: parseInt(slot.dayOfWeek, 10),
            startTime: typeof slot.startTime === 'string' ? parseTime(slot.startTime) : slot.startTime,
            endTime: typeof slot.endTime === 'string' ? parseTime(slot.endTime) : slot.endTime,
            priceModifier: parseFloat(slot.priceModifier || 1.0),
            isAvailable: slot.isAvailable ?? true,
          },
        });
      }),
    );

    return createdSlots.map((ts) => ({
      ...ts,
      id: ts.id.toString(),
      serviceId: ts.serviceId.toString(),
      priceModifier: parseFloat(ts.priceModifier.toString()),
    }));
  }
}

