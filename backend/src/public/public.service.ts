import { Injectable, BadRequestException } from '@nestjs/common';
import {
  ACTIVE_BOOKING_STATUSES,
  ALLOWED_DURATIONS,
  bookingStartAt,
  calculatePricing,
  DEFAULT_DURATION,
  evaluateSlot,
  formatMinutes,
  isAllowedDuration,
  nowInVietnam,
  parseBookingDate,
  rangesOverlap,
  timeToMinutes,
} from '../bookings/booking-rules';
import { PrismaService } from '../prisma/prisma.service';

export function serializePublicLocation(loc: any) {
  if (!loc) return null;
  return {
    ...loc,
    id: loc.id.toString(),
    partnerId: loc.partnerId?.toString(),
    partnerUserId: loc.partner?.userId?.toString() || null,
    partner: loc.partner ? {
      id: loc.partner.id.toString(),
      userId: loc.partner.userId.toString(),
      businessName: loc.partner.businessName,
      bankName: loc.partner.bankName || null,
      bankAccountNumber: loc.partner.bankAccountNumber || null,
      bankAccountName: loc.partner.bankAccountName || null,
    } : null,
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
  async findLocations(city?: string, category?: string, search?: string, provinceCode?: string) {
    const locations = await this.prisma.location.findMany({
      where: {
        isActive: true,
        ...(provinceCode ? { provinceCode } : {}),
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

  // Lấy các slot khả dụng của sân theo ngày cụ thể và thời lượng chơi mong muốn.
  // Dùng chung quy tắc với bước tạo đơn (booking-rules) để những gì hiển thị "còn trống" thì đặt được.
  async getAvailableSlots(serviceId: string, date: string, duration: number = DEFAULT_DURATION) {
    const bookingDate = parseBookingDate(date);
    if (!bookingDate || !/^\d+$/.test(serviceId)) {
      throw new BadRequestException('Tham số ngày hoặc mã sân không hợp lệ.');
    }
    if (!isAllowedDuration(duration)) {
      throw new BadRequestException(`Thời lượng thuê không hợp lệ (chỉ hỗ trợ ${ALLOWED_DURATIONS.join(', ')} giờ).`);
    }

    const pitchId = BigInt(serviceId);
    const service = await this.prisma.sportsPitch.findFirst({
      where: { id: pitchId, isActive: true },
      select: { basePricePerHour: true },
    });
    if (!service) return [];

    const dayOfWeek = bookingDate.getUTCDay(); // 0 = CN, 1 = T2, ...
    const [timeSlots, overrides, bookedSlots] = await Promise.all([
      // Lấy cả khung giờ đang đóng để kiểm tra ca đấu không kéo dài vào khung đóng
      this.prisma.timeSlot.findMany({
        where: { sportsPitchId: pitchId, dayOfWeek },
        orderBy: { startTime: 'asc' },
      }),
      this.prisma.slotOverride.findMany({
        where: { sportsPitchId: pitchId, overrideDate: bookingDate },
      }),
      // Các booking đang giữ chỗ trong ngày đó
      this.prisma.booking.findMany({
        where: {
          sportsPitchId: pitchId,
          bookingDate,
          status: { in: ACTIVE_BOOKING_STATUSES },
        },
        select: { startTime: true, endTime: true },
      }),
    ]);

    const now = nowInVietnam();
    const availableSlots: any[] = [];

    for (const ts of timeSlots) {
      if (!ts.isAvailable) continue;
      const evaluation = evaluateSlot(ts, timeSlots, overrides, duration);

      // Ca vượt giờ mở cửa thì không hiển thị (giữ hành vi cũ)
      if (evaluation.unavailableKind === 'hours') continue;

      const isTaken = bookedSlots.some((b) =>
        rangesOverlap(evaluation.startMinutes, evaluation.endMinutes, timeToMinutes(b.startTime), timeToMinutes(b.endTime)),
      );
      const isPast = bookingStartAt(bookingDate, ts.startTime) <= now;
      const { courtCost } = calculatePricing({
        basePricePerHour: service.basePricePerHour,
        priceModifier: evaluation.priceModifier,
        durationHours: duration,
        products: [],
      });

      availableSlots.push({
        id: `${ts.id.toString()}_${duration}`,
        dayOfWeek: ts.dayOfWeek,
        startTime: formatMinutes(evaluation.startMinutes),
        endTime: formatMinutes(evaluation.endMinutes),
        priceModifier: evaluation.priceModifier.toNumber(),
        isAvailable: ts.isAvailable,
        // Đã có người đặt, đã qua giờ hoặc sân tạm đóng đều không cho chọn
        isBooked: isTaken || isPast || !!evaluation.unavailableReason,
        unavailableReason: evaluation.unavailableReason ?? (isTaken ? 'Đã có người đặt' : isPast ? 'Đã qua giờ' : null),
        durationHours: duration,
        finalPrice: courtCost.toNumber(), // Tiền sân trước VAT (giống trước đây)
      });
    }

    return availableSlots;
  }

  // Cơ sở trong bán kính radiusKm quanh (lat, lng), gần nhất trước.
  // Lọc thô theo khung tọa độ (dùng index latitude/longitude) rồi tính khoảng cách haversine.
  async findNearbyLocations(lat: number, lng: number, radiusKm = 5) {
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      throw new BadRequestException('Tọa độ không hợp lệ.');
    }
    const radius = Math.min(Math.max(Number.isFinite(radiusKm) ? radiusKm : 5, 0.1), 50);
    const latDelta = radius / 111.32;
    const lngDelta = radius / (111.32 * Math.max(Math.cos((lat * Math.PI) / 180), 0.01));

    const rows = await this.prisma.$queryRaw<{ id: bigint; distance_km: number }[]>`
      SELECT id, distance_km FROM (
        SELECT id,
          6371 * 2 * ASIN(SQRT(
            POWER(SIN(RADIANS(latitude::float8 - ${lat}::float8) / 2), 2) +
            COS(RADIANS(${lat}::float8)) * COS(RADIANS(latitude::float8)) *
            POWER(SIN(RADIANS(longitude::float8 - ${lng}::float8) / 2), 2)
          )) AS distance_km
        FROM locations
        WHERE is_active = true AND deleted_at IS NULL
          AND latitude BETWEEN ${lat - latDelta} AND ${lat + latDelta}
          AND longitude BETWEEN ${lng - lngDelta} AND ${lng + lngDelta}
      ) AS t
      WHERE distance_km <= ${radius}
      ORDER BY distance_km
      LIMIT 50`;
    if (rows.length === 0) return [];

    const locations = await this.prisma.location.findMany({
      where: { id: { in: rows.map((r) => r.id) } },
      include: {
        locationAmenities: { include: { amenity: true } },
        _count: { select: { sportsPitches: true } },
        sportsPitches: {
          where: { isActive: true },
          select: { id: true, name: true, category: true, subType: true, basePricePerHour: true, imageUrls: true },
          take: 4,
        },
      },
    });
    const distance = new Map(rows.map((r) => [r.id.toString(), Math.round(Number(r.distance_km) * 100) / 100]));
    return locations
      .map((l) => ({ ...serializePublicLocation(l), distanceKm: distance.get(l.id.toString()) }))
      .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  }

  async getProvinces() {
    return this.prisma.locationProvince.findMany({
      select: { provinceCode: true, name: true, shortName: true, placeType: true },
      orderBy: { name: 'asc' },
    });
  }

  async getWards(provinceCode: string) {
    return this.prisma.locationWard.findMany({
      where: { provinceCode },
      select: { wardCode: true, name: true, provinceCode: true },
      orderBy: { name: 'asc' },
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
