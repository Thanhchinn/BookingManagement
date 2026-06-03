import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

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

  // Lấy danh sách cơ sở của đối tác
  async findAll(userId: string | number | bigint) {
    const partner = await this.getPartnerProfile(userId);
    const locations = await this.prisma.location.findMany({
      where: { partnerId: partner.id },
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
  async remove(id: string | number | bigint, userId: string | number | bigint) {
    await this.findOne(id, userId);
    await this.prisma.location.delete({
      where: { id: BigInt(id) },
    });
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
