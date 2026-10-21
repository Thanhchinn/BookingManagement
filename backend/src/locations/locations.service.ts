import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { countUpcomingBookings } from '../bookings/booking-rules';
import { resolveAddressCodes } from '../common/utils/address.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { PartnersService } from '../partners/partners.service';

// Hàm helper serialize BigInt thành string/number trong Location
export function serializeLocation(loc: any) {
  if (!loc) return null;
  return {
    ...loc,
    id: loc.id.toString(),
    partnerId: loc.partnerId.toString(),
    latitude: loc.latitude ? parseFloat(loc.latitude.toString()) : null,
    longitude: loc.longitude ? parseFloat(loc.longitude.toString()) : null,
    locationAmenities: loc.locationAmenities?.map((la: any) => ({
      amenityId: la.amenityId.toString(),
      name: la.amenity?.name,
      icon: la.amenity?.icon,
    })) || [],
  };
}

@Injectable()
export class LocationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly partnersService: PartnersService,
  ) {}

  // Lấy Profile đối tác từ User ID
  private async getPartnerProfile(userId: string | number | bigint) {
    return this.partnersService.getPartnerProfileOrThrow(userId);
  }

  // Lấy danh sách cơ sở của đối tác
  async findAll(userId: string | number | bigint) {
    const partner = await this.getPartnerProfile(userId);
    const locations = await this.prisma.location.findMany({
      where: { partnerId: partner.id, deletedAt: null },
      include: {
        locationAmenities: {
          include: {
            amenity: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return locations.map(serializeLocation);
  }

  // Lấy chi tiết 1 cơ sở
  async findOne(id: string | number | bigint, userId: string | number | bigint) {
    const partner = await this.getPartnerProfile(userId);
    const location = await this.prisma.location.findFirst({
      where: {
        id: BigInt(id),
        partnerId: partner.id,
        deletedAt: null,
      },
      include: {
        locationAmenities: {
          include: {
            amenity: true,
          },
        },
      },
    });

    if (!location) {
      throw new NotFoundException(`Không tìm thấy cơ sở có ID: ${id}`);
    }
    return serializeLocation(location);
  }

  // Tạo mới một cơ sở
  async create(dto: CreateLocationDto, userId: string | number | bigint) {
    const partner = await this.getPartnerProfile(userId);

    // Nếu cơ sở này được đánh dấu là cơ sở chính, bỏ trạng thái primary của các cơ sở khác
    if (dto.isPrimary) {
      await this.prisma.location.updateMany({
        where: { partnerId: partner.id, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const newLocation = await this.prisma.location.create({
      data: {
        partnerId: partner.id,
        name: dto.name,
        address: dto.address,
        ward: dto.ward || null,
        district: dto.district || null,
        city: dto.city || null,
        ...(await resolveAddressCodes(this.prisma, dto.provinceCode, dto.wardCode)),
        contactPhone: dto.contactPhone || null,
        imageUrl: dto.imageUrl || null,
        latitude: dto.latitude || null,
        longitude: dto.longitude || null,
        isActive: dto.isActive ?? true,
        isPrimary: dto.isPrimary ?? false,
        locationAmenities: dto.amenityIds ? {
          create: dto.amenityIds.map((id) => ({
            amenityId: BigInt(id),
          })),
        } : undefined,
      },
      include: {
        locationAmenities: {
          include: {
            amenity: true,
          },
        },
      },
    });

    return serializeLocation(newLocation);
  }

  // Cập nhật cơ sở
  async update(id: string | number | bigint, dto: UpdateLocationDto, userId: string | number | bigint) {
    // Đảm bảo cơ sở thuộc sở hữu của đối tác
    await this.findOne(id, userId);

    const partner = await this.getPartnerProfile(userId);

    // Nếu đánh dấu primary, hủy primary của các cơ sở khác
    if (dto.isPrimary) {
      await this.prisma.location.updateMany({
        where: { partnerId: partner.id, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    // Cập nhật tiện ích (nếu truyền danh sách mới)
    if (dto.amenityIds !== undefined) {
      await this.prisma.locationAmenity.deleteMany({
        where: { locationId: BigInt(id) },
      });
    }

    const updated = await this.prisma.location.update({
      where: { id: BigInt(id) },
      data: {
        name: dto.name,
        address: dto.address,
        ward: dto.ward,
        district: dto.district,
        city: dto.city,
        ...(await resolveAddressCodes(this.prisma, dto.provinceCode, dto.wardCode)),
        contactPhone: dto.contactPhone,
        imageUrl: dto.imageUrl,
        latitude: dto.latitude,
        longitude: dto.longitude,
        isActive: dto.isActive,
        isPrimary: dto.isPrimary,
        locationAmenities: dto.amenityIds ? {
          create: dto.amenityIds.map((aid) => ({
            amenityId: BigInt(aid),
          })),
        } : undefined,
      },
      include: {
        locationAmenities: {
          include: {
            amenity: true,
          },
        },
      },
    });

    return serializeLocation(updated);
  }

  // Xóa cơ sở
  // Xóa mềm cơ sở cùng toàn bộ sân và sản phẩm bên trong (giữ lịch sử đặt sân)
  async remove(id: string | number | bigint, userId: string | number | bigint) {
    await this.findOne(id, userId);
    const locationId = BigInt(id);

    const upcoming = await countUpcomingBookings(this.prisma, { sportsPitch: { locationId } });
    if (upcoming > 0) {
      throw new ConflictException(
        `Cơ sở còn ${upcoming} đơn đặt sân sắp diễn ra. Vui lòng xử lý (hủy/hoàn tất) các đơn này trước khi xóa.`,
      );
    }

    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.sportsPitch.updateMany({
        where: { locationId, deletedAt: null },
        data: { deletedAt: now, isActive: false },
      }),
      this.prisma.product.updateMany({
        where: { locationId, deletedAt: null },
        data: { deletedAt: now, isAvailable: false },
      }),
      this.prisma.location.update({
        where: { id: locationId },
        data: { deletedAt: now, isActive: false, isPrimary: false },
      }),
    ]);
    return { message: 'Đã xóa cơ sở thành công.' };
  }

  // Lấy tất cả tiện ích chung của hệ thống để hiển thị checkbox lựa chọn
  async getSystemAmenities() {
    const amenities = await this.prisma.amenity.findMany({
      orderBy: { name: 'asc' },
    });
    return amenities.map((a) => ({
      id: a.id.toString(),
      name: a.name,
      icon: a.icon,
    }));
  }
}
