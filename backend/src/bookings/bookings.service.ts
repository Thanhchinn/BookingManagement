import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  private async validateSlotAvailability(pitchId: bigint, slotIdStr: string, bookingDate: Date) {
    const sportsPitch = await this.prisma.sportsPitch.findUnique({
      where: { id: pitchId },
      include: {
        location: {
          include: { partner: true }
        }
      },
    });
    if (!sportsPitch) {
      throw new NotFoundException('Không tìm thấy sân đấu yêu cầu.');
    }

    let baseSlotId: bigint;
    let durationHours = 1.5;

    if (slotIdStr.includes('_')) {
      const [idPart, durPart] = slotIdStr.split('_');
      baseSlotId = BigInt(idPart);
      durationHours = parseFloat(durPart);
    } else {
      baseSlotId = BigInt(slotIdStr);
    }

    const timeSlot = await this.prisma.timeSlot.findUnique({
      where: { id: baseSlotId },
    });
    if (!timeSlot) {
      throw new NotFoundException('Không tìm thấy ca đấu yêu cầu.');
    }

    const startIso = timeSlot.startTime.toISOString().substring(11, 16);
    const [startH, startM] = startIso.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = startMinutes + durationHours * 60;

    const endH = Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;

    const dynamicStartTime = new Date('1970-01-01T00:00:00Z');
    dynamicStartTime.setUTCHours(startH, startM, 0, 0);

    const dynamicEndTime = new Date('1970-01-01T00:00:00Z');
    dynamicEndTime.setUTCHours(endH, endM, 0, 0);

    const booked = await this.prisma.booking.findMany({
      where: {
        sportsPitchId: pitchId,
        bookingDate,
        status: { in: ['CONFIRMED', 'PENDING'] },
      },
    });

    const newStartStr = dynamicStartTime.toISOString().substring(11, 19);
    const newEndStr = dynamicEndTime.toISOString().substring(11, 19);

    const isBooked = booked.some((b) => {
      const bStart = b.startTime.toISOString().substring(11, 19);
      const bEnd = b.endTime.toISOString().substring(11, 19);
      return newStartStr < bEnd && newEndStr > bStart;
    });

    if (isBooked) {
      throw new BadRequestException('Khung giờ này đã được đặt trước hoặc trùng giờ với một lịch đặt khác. Vui lòng chọn ca đấu khác.');
    }

    return { 
      sportsPitch, 
      timeSlot: {
        ...timeSlot,
        startTime: dynamicStartTime,
        endTime: dynamicEndTime,
      } 
    };
  }

  private calculateCourtPrice(sportsPitch: any, timeSlot: any): number {
    const startIso = timeSlot.startTime.toISOString().substring(11, 16);
    const endIso = timeSlot.endTime.toISOString().substring(11, 16);
    const [startH, startM] = startIso.split(':').map(Number);
    const [endH, endM] = endIso.split(':').map(Number);

    let endMinutes = endH * 60 + endM;
    const startMinutes = startH * 60 + startM;
    if (endMinutes < startMinutes) {
      endMinutes += 1440; // Xử lý qua đêm: cộng thêm 24 giờ (1440 phút)
    }
    const durationHours = (endMinutes - startMinutes) / 60;

    const basePricePerHour = parseFloat(sportsPitch.basePricePerHour.toString());
    const priceModifier = parseFloat(timeSlot.priceModifier.toString());
    return Math.round(basePricePerHour * priceModifier * durationHours);
  }

  private async calculateProductsCost(products?: { productId: string; quantity: number }[]) {
    let serviceCost = 0;
    const validatedProducts: { productId: bigint; quantity: number; price: number }[] = [];

    if (products && Array.isArray(products) && products.length > 0) {
      for (const item of products) {
        const prod = await this.prisma.product.findUnique({
          where: { id: BigInt(item.productId) },
        });
        if (prod && item.quantity > 0) {
          const prodPrice = parseFloat(prod.price.toString());
          serviceCost += prodPrice * item.quantity;
          validatedProducts.push({
            productId: prod.id,
            quantity: item.quantity,
            price: prodPrice,
          });
        }
      }
    }

    return { serviceCost, validatedProducts };
  }

  private async applyPromotionDiscount(promoCode?: string, totalBeforePromo = 0) {
    let promoId: bigint | null = null;
    let discountAmount = 0;

    if (promoCode) {
      const promotion = await this.prisma.promotion.findUnique({
        where: { code: promoCode },
      });
      if (promotion) {
        const now = new Date();
        const minOrder = parseFloat(promotion.minOrderValue.toString());
        if (
          now >= promotion.startDate &&
          now <= promotion.endDate &&
          totalBeforePromo >= minOrder &&
          (promotion.usageLimit === 0 || promotion.usedCount < promotion.usageLimit)
        ) {
          promoId = promotion.id;
          const discountPercent = parseFloat(promotion.discountPercent.toString());
          let calculatedDiscount = totalBeforePromo * (discountPercent / 100);

          if (promotion.maxDiscountAmount) {
            const maxDisc = parseFloat(promotion.maxDiscountAmount.toString());
            if (calculatedDiscount > maxDisc) {
              calculatedDiscount = maxDisc;
            }
          }
          discountAmount = Math.round(calculatedDiscount);
        }
      }
    }

    return { promoId, discountAmount };
  }

  // 1. Tạo mới một booking
  async createBooking(userIdStr: string, body: any) {
    const {
      sportsPitchId,
      bookingDate,
      slotId,
      paymentMethod, // 'CASH' | 'MOMO' | 'VNPAY'
      paymentOption, // 'CASH' | 'FULL' | 'PARTIAL'
      products,      // array of { productId: string, quantity: number }
      promoCode,
    } = body;

    const userId = BigInt(userIdStr);
    const pitchId = BigInt(sportsPitchId);
    const slotIdStr = slotId.toString();
    const parsedDate = new Date(bookingDate);

    // 1. Validate availability
    const { sportsPitch, timeSlot } = await this.validateSlotAvailability(pitchId, slotIdStr, parsedDate);

    // 2. Calculate court price
    const courtCost = this.calculateCourtPrice(sportsPitch, timeSlot);

    // 3. Calculate products cost
    const { serviceCost, validatedProducts } = await this.calculateProductsCost(products);

    // 4. Calculate total and promotions
    const subtotal = courtCost + serviceCost;
    const vat = Math.round(subtotal * 0.1);
    const totalBeforePromo = subtotal + vat;

    const { promoId, discountAmount } = await this.applyPromotionDiscount(promoCode, totalBeforePromo);
    const finalPrice = Math.max(0, totalBeforePromo - discountAmount);

    // 5. Booking code & initial payment status and booking status
    const bookingCode = 'BKG-' + Math.floor(Math.random() * 900000 + 100000);
    
    let paymentStatus = 'UNPAID';
    let bookingStatus = 'PENDING';

    if (paymentMethod === 'MOMO' || paymentMethod === 'VNPAY') {
      paymentStatus = paymentOption === 'PARTIAL' ? 'PARTIALLY_PAID' : 'PAID';
      bookingStatus = 'CONFIRMED';
    } else if (paymentMethod === 'CASH') {
      bookingStatus = 'CONFIRMED';
      paymentStatus = 'UNPAID';
    } else if (paymentMethod === 'BANK_TRANSFER') {
      bookingStatus = 'PENDING';
      paymentStatus = 'UNPAID';
    }

    // Dynamic commission calculation based on partner profile
    const partner = sportsPitch.location?.partner;
    const commissionType = partner?.commissionType || 'PERCENTAGE';
    let commissionRate: number | null = null;
    let commissionFixedAmount: number | null = null;
    let commissionAmount = 0;

    if (commissionType === 'PERCENTAGE') {
      commissionRate = partner ? parseFloat(partner.commissionRate.toString()) : 10;
      commissionAmount = Math.round(finalPrice * (commissionRate / 100));
    } else {
      commissionFixedAmount = partner ? parseFloat(partner.commissionFixedAmount.toString()) : 0;
      commissionAmount = commissionFixedAmount;
    }

    // 6. DB Transaction
    const bookingResult = await this.prisma.$transaction(async (tx) => {
      // Create Booking
      const newBooking = await tx.booking.create({
        data: {
          bookingCode,
          userId,
          sportsPitchId: pitchId,
          promoId,
          bookingDate: parsedDate,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          basePrice: courtCost,
          discountAmount,
          finalPrice,
          commissionType,
          commissionRate,
          commissionFixedAmount,
          commissionAmount,
          status: bookingStatus,
          paymentStatus,
        },
      });

      // Create BookingDetails
      for (const vp of validatedProducts) {
        await tx.bookingDetail.create({
          data: {
            bookingId: newBooking.id,
            productId: vp.productId,
            quantity: vp.quantity,
            price: vp.price,
          },
        });
      }

      // Create Payment log
      let payAmount = 0;
      let payType = 'CASH';
      let payStatus = 'PENDING';

      if (paymentMethod === 'MOMO' || paymentMethod === 'VNPAY') {
        payStatus = 'SUCCESS';
        if (paymentOption === 'PARTIAL') {
          payAmount = Math.round(finalPrice * 0.3);
          payType = 'DEPOSIT';
        } else {
          payAmount = finalPrice;
          payType = 'FULL';
        }
      } else if (paymentMethod === 'BANK_TRANSFER') {
        payStatus = 'PENDING';
        if (paymentOption === 'PARTIAL') {
          payAmount = Math.round(finalPrice * 0.3);
          payType = 'DEPOSIT';
        } else {
          payAmount = finalPrice;
          payType = 'FULL';
        }
      } else {
        payAmount = 0;
        payType = 'CASH';
        payStatus = 'PENDING';
      }

      await tx.payment.create({
        data: {
          bookingId: newBooking.id,
          amount: payAmount,
          paymentMethod,
          paymentType: payType,
          status: payStatus,
          transactionId: payStatus === 'SUCCESS' ? 'TXN-' + Math.floor(Math.random() * 90000000 + 10000000) : null,
        },
      });

      // Update Promotion Used Count if applicable
      if (promoId) {
        await tx.promotion.update({
          where: { id: promoId },
          data: { usedCount: { increment: 1 } },
        });
      }

      return newBooking;
    });

    // Get fully populated booking
    const fullBooking = await this.prisma.booking.findUnique({
      where: { id: bookingResult.id },
      include: {
        sportsPitch: {
          include: { location: true },
        },
        user: true,
        bookingDetails: {
          include: { product: true },
        },
        payments: true,
      },
    });

    return fullBooking;
  }

  // 2. Lấy danh sách lịch đặt sân của khách hàng
  async getMyBookings(userIdStr: string) {
    const userId = BigInt(userIdStr);
    const list = await this.prisma.booking.findMany({
      where: { userId },
      include: {
        sportsPitch: {
          include: { location: true },
        },
        bookingDetails: {
          include: { product: true },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return list;
  }

  // 3. Lấy danh sách lịch đặt sân của cơ sở thuộc chủ đối tác
  async getPartnerBookings(userIdStr: string) {
    const userId = BigInt(userIdStr);
    
    // Tìm profile của partner
    const partnerProfile = await this.prisma.partnerProfile.findUnique({
      where: { userId },
    });
    if (!partnerProfile) {
      throw new BadRequestException('Tài khoản của bạn không phải là tài khoản Đối tác/Chủ sân.');
    }

    const list = await this.prisma.booking.findMany({
      where: {
        sportsPitch: {
          location: {
            partnerId: partnerProfile.id,
          },
        },
      },
      include: {
        sportsPitch: {
          include: { location: true },
        },
        user: true,
        bookingDetails: {
          include: { product: true },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return list;
  }

  // 4. Phê duyệt/Hủy đặt sân / Hoàn tiền
  async updateStatus(
    userIdStr: string,
    bookingIdStr: string,
    status?: string,
    paymentStatus?: string,
    cancellationReason?: string,
  ) {
    const bookingId = BigInt(bookingIdStr);
    const userId = BigInt(userIdStr);

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        sportsPitch: {
          include: { location: true },
        },
        payments: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Không tìm thấy đơn đặt sân.');
    }

    // Xác minh quyền: Chỉ cho phép User hủy đơn của chính họ, hoặc Đối tác/Chủ sân, hoặc Admin
    const partnerProfile = await this.prisma.partnerProfile.findUnique({
      where: { userId },
    });
    const adminUser = await this.prisma.admin.findUnique({
      where: { id: userId },
    });

    const isOwnerUser = booking.userId === userId;
    const isOwnerPartner = partnerProfile && booking.sportsPitch.location.partnerId === partnerProfile.id;
    const isAdmin = !!adminUser;

    if (!isOwnerUser && !isOwnerPartner && !isAdmin) {
      throw new BadRequestException('Bạn không có quyền thay đổi trạng thái đơn đặt sân này.');
    }

    // Cập nhật trạng thái
    const dataToUpdate: any = {};
    if (status) {
      dataToUpdate.status = status;
    }
    if (paymentStatus) {
      dataToUpdate.paymentStatus = paymentStatus;
    } else if (status === 'CANCELLED') {
      dataToUpdate.paymentStatus = booking.paymentStatus !== 'UNPAID' ? 'REFUNDED' : booking.paymentStatus;
    }
    if (cancellationReason) {
      dataToUpdate.cancellationReason = cancellationReason;
    } else if (status === 'CANCELLED' && !booking.cancellationReason) {
      dataToUpdate.cancellationReason = isAdmin 
        ? 'Quản trị viên hủy lịch đặt.' 
        : (isOwnerPartner ? 'Chủ sân hủy lịch đặt.' : 'Khách hàng hủy lịch đặt.');
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: dataToUpdate,
      include: {
        sportsPitch: {
          include: { location: true },
        },
        user: true,
        bookingDetails: {
          include: { product: true },
        },
        payments: true,
      },
    });

    // Nếu hủy đơn đặt lịch hoặc hoàn tiền, cập nhật trạng thái các Payments liên quan sang FAILED
    if (status === 'CANCELLED' || paymentStatus === 'REFUNDED') {
      await this.prisma.payment.updateMany({
        where: { bookingId },
        data: { status: 'FAILED' },
      });
    }

    return updated;
  }

  // 5. Lấy danh sách toàn bộ đặt sân dành cho Admin
  async getAdminBookings(userIdStr: string) {
    const userId = BigInt(userIdStr);
    
    // Xác minh quyền Admin
    const adminUser = await this.prisma.admin.findUnique({
      where: { id: userId },
    });
    if (!adminUser) {
      throw new BadRequestException('Tài khoản của bạn không có quyền Quản trị viên.');
    }

    const list = await this.prisma.booking.findMany({
      include: {
        sportsPitch: {
          include: { location: true },
        },
        user: true,
        bookingDetails: {
          include: { product: true },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return list;
  }

  // 6. Xóa lịch đặt khi đã bị hủy (Chủ sân/Đối tác hoặc Admin)
  async deleteBooking(userIdStr: string, bookingIdStr: string) {
    const bookingId = BigInt(bookingIdStr);
    const userId = BigInt(userIdStr);

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        sportsPitch: {
          include: { location: true },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Không tìm thấy đơn đặt sân.');
    }

    const partnerProfile = await this.prisma.partnerProfile.findUnique({
      where: { userId },
    });
    const adminUser = await this.prisma.admin.findUnique({
      where: { id: userId },
    });

    const isOwnerPartner = partnerProfile && booking.sportsPitch.location.partnerId === partnerProfile.id;
    const isAdmin = !!adminUser;

    if (!isOwnerPartner && !isAdmin) {
      throw new ForbiddenException('Bạn không có quyền xóa lịch đặt này.');
    }

    if (booking.status !== 'CANCELLED') {
      throw new BadRequestException('Chỉ có thể xóa lịch đặt khi trạng thái là ĐÃ HỦY (CANCELLED).');
    }

    await this.prisma.booking.delete({
      where: { id: bookingId },
    });

    return { message: 'Đã xóa lịch đặt thành công.' };
  }
}
