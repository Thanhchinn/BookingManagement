import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export function serializePublicLocation(loc: any) {
  if (!loc) return null;
  return {
    ...loc,
    id: loc.id.toString(),
    partnerId: loc.partnerId?.toString(),
    partnerUserId: loc.partner?.userId?.toString() || null,
    latitude: loc.latitude ? parseFloat(loc.latitude.toString()) : null,
    longitude: loc.longitude ? parseFloat(loc.longitude.toString()) : null,
    locationAmenities: loc.locationAmenities?.map((la: any) => ({
      amenityId: la.amenityId?.toString(),
      name: la.amenity?.name,
      icon: la.amenity?.icon,
    })) || [],
    services: loc.sportsPitches?.map((s: any) => serializePublicService(s)) || [],
    sportsPitches: loc.sportsPitches?.map((s: any) => serializePublicService(s)) || [],
    _count: loc._count ? {
      ...loc._count,
      services: loc._count.sportsPitches,
      sportsPitches: loc._count.sportsPitches,
    } : undefined,
  };
}

export function serializePublicService(s: any) {
  if (!s) return null;
  return {
    ...s,
    id: s.id.toString(),
    locationId: s.locationId?.toString(),
    basePricePerHour: s.basePricePerHour ? parseFloat(s.basePricePerHour.toString()) : 0,
    timeSlots: s.timeSlots?.map((t: any) => ({
      ...t,
      id: t.id.toString(),
      serviceId: t.sportsPitchId?.toString(),
      sportsPitchId: t.sportsPitchId?.toString(),
      priceModifier: parseFloat(t.priceModifier.toString()),
    })) || [],
    reviews: s.reviews?.map((r: any) => ({
      ...r,
      id: r.id.toString(),
      serviceId: r.sportsPitchId?.toString(),
      sportsPitchId: r.sportsPitchId?.toString(),
      userId: r.userId.toString(),
      user: r.user ? { fullName: r.user.fullName, avatarUrl: r.user.avatarUrl } : null,
    })) || [],
    _count: s._count,
  };
}

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy danh sách cơ sở công khai (cho trang tìm kiếm của client)
  async findLocations(city?: string, category?: string, search?: string) {
    const locations = await this.prisma.location.findMany({
      where: {
        isActive: true,
        ...(city && city !== 'all' ? { city: { contains: city, mode: 'insensitive' } } : {}),
        ...(search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } },
            { city: { contains: search, mode: 'insensitive' } },
          ]
        } : {}),
        ...(category && category !== 'all' ? {
          sportsPitches: {
            some: {
              category: { contains: category, mode: 'insensitive' },
              isActive: true,
            }
          }
        } : {}),
      },
      include: {
        locationAmenities: { include: { amenity: true } },
        _count: { select: { sportsPitches: true } },
        sportsPitches: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            category: true,
            subType: true,
            basePricePerHour: true,
            imageUrls: true,
            isActive: true,
            _count: { select: { reviews: true, timeSlots: true } },
          },
          take: 4, // preview 4 sân đầu tiên
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return locations.map(serializePublicLocation);
  }

  // Lấy tất cả sân đấu đang hoạt động
  async findSportsPitches() {
    const pitches = await this.prisma.sportsPitch.findMany({
      where: { isActive: true },
      include: {
        location: {
          select: {
            name: true,
            city: true,
            district: true,
          }
        },
        _count: { select: { reviews: true, timeSlots: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 12,
    });
    return pitches.map((s: any) => ({
      ...serializePublicService(s),
      locationName: s.location?.name,
      locationCity: s.location?.city,
      locationDistrict: s.location?.district,
    }));
  }

  // Lấy chi tiết 1 cơ sở công khai
  async findLocationById(id: string) {
    const location = await this.prisma.location.findFirst({
      where: { id: BigInt(id), isActive: true },
      include: {
        partner: true,
        locationAmenities: { include: { amenity: true } },
        sportsPitches: {
          where: { isActive: true },
          include: {
            _count: { select: { reviews: true, timeSlots: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { sportsPitches: true } },
      },
    });
    if (!location) return null;
    return serializePublicLocation(location);
  }

  // Lấy chi tiết 1 sân công khai (bao gồm timeslots + reviews)
  async findServiceById(id: string) {
    const service = await this.prisma.sportsPitch.findFirst({
      where: { id: BigInt(id), isActive: true },
      include: {
        location: {
          include: {
            locationAmenities: { include: { amenity: true } },
          }
        },
        timeSlots: {
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        },
        reviews: {
          include: {
            user: { select: { fullName: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: { select: { reviews: true, timeSlots: true } },
      },
    });
    if (!service) return null;
    return serializePublicService(service);
  }

  // Lấy các slot khả dụng của sân theo ngày cụ thể
  async getAvailableSlots(serviceId: string, date: string) {
    const service = await this.prisma.sportsPitch.findFirst({
      where: { id: BigInt(serviceId), isActive: true },
      select: { basePricePerHour: true },
    });
    if (!service) return [];

    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay(); // 0 = Sun, 1 = Mon, ...

    // Lấy tất cả timeslots của ngày trong tuần đó
    const timeSlots = await this.prisma.timeSlot.findMany({
      where: { sportsPitchId: BigInt(serviceId), dayOfWeek, isAvailable: true },
      orderBy: { startTime: 'asc' },
    });

    // Lấy các booking đã được xác nhận trong ngày đó
    const bookedSlots = await this.prisma.booking.findMany({
      where: {
        sportsPitchId: BigInt(serviceId),
        bookingDate: new Date(date),
        status: { in: ['CONFIRMED', 'PENDING'] },
      },
      select: { startTime: true, endTime: true },
    });

    const basePricePerHour = parseFloat(service.basePricePerHour.toString());

    return timeSlots.map((ts: any) => {
      const startStr = ts.startTime.toISOString().substring(11, 16); // HH:mm
      const endStr = ts.endTime.toISOString().substring(11, 16);

      // Kiểm tra xem slot này đã bị đặt chưa
      const isBooked = bookedSlots.some((b: any) => {
        const bStart = b.startTime.toISOString().substring(11, 16);
        return bStart === startStr;
      });

      // Tính giờ chơi
      const [startH, startM] = startStr.split(':').map(Number);
      const [endH, endM] = endStr.split(':').map(Number);
      const durationHours = (endH * 60 + endM - (startH * 60 + startM)) / 60;
      const priceModifier = parseFloat(ts.priceModifier.toString());
      const finalPrice = Math.round(basePricePerHour * priceModifier * durationHours);

      return {
        id: ts.id.toString(),
        dayOfWeek: ts.dayOfWeek,
        startTime: startStr,
        endTime: endStr,
        priceModifier,
        isAvailable: ts.isAvailable,
        isBooked,
        durationHours,
        finalPrice,
      };
    });
  }

  // Lấy sản phẩm bán kèm của cơ sở
  async getProductsByLocation(locationId: string) {
    const products = await this.prisma.product.findMany({
      where: { locationId: BigInt(locationId), isAvailable: true },
      orderBy: { createdAt: 'asc' },
    });
    return products.map((p: any) => ({
      ...p,
      id: p.id.toString(),
      locationId: p.locationId.toString(),
      price: parseFloat(p.price.toString()),
    }));
  }
}
