import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function serializeBooking(booking: any) {
  if (!booking) return null;
  return {
    id: booking.id.toString(),
    bookingCode: booking.bookingCode,
    userId: booking.userId.toString(),
    sportsPitchId: booking.sportsPitchId.toString(),
    promoId: booking.promoId ? booking.promoId.toString() : null,
    bookingDate: booking.bookingDate.toISOString().split('T')[0],
    startTime: booking.startTime.toISOString().substring(11, 16),
    endTime: booking.endTime.toISOString().substring(11, 16),
    basePrice: parseFloat(booking.basePrice.toString()),
    discountAmount: parseFloat(booking.discountAmount.toString()),
    finalPrice: parseFloat(booking.finalPrice.toString()),
    commissionAmount: parseFloat(booking.commissionAmount.toString()),
    cancellationReason: booking.cancellationReason || null,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    createdAt: booking.createdAt,
    sportsPitch: booking.sportsPitch ? {
      id: booking.sportsPitch.id.toString(),
      name: booking.sportsPitch.name,
      category: booking.sportsPitch.category,
      location: booking.sportsPitch.location ? {
        id: booking.sportsPitch.location.id.toString(),
        name: booking.sportsPitch.location.name,
        address: booking.sportsPitch.location.address,
        ward: booking.sportsPitch.location.ward,
        district: booking.sportsPitch.location.district,
        city: booking.sportsPitch.location.city,
      } : undefined
    } : undefined,
    user: booking.user ? {
      id: booking.user.id.toString(),
      fullName: booking.user.fullName,
      phone: booking.user.phone,
      email: booking.user.email,
    } : undefined,
    bookingDetails: booking.bookingDetails ? booking.bookingDetails.map((d: any) => ({
      id: d.id.toString(),
      productId: d.productId.toString(),
      quantity: d.quantity,
      price: parseFloat(d.price.toString()),
      product: d.product ? {
        id: d.product.id.toString(),
        name: d.product.name,
        category: d.product.category,
      } : undefined
    })) : [],
    payments: booking.payments ? booking.payments.map((p: any) => ({
      id: p.id.toString(),
      amount: parseFloat(p.amount.toString()),
      paymentMethod: p.paymentMethod,
      paymentType: p.paymentType,
      status: p.status,
      createdAt: p.createdAt
    })) : [],
  };
}

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

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
    const slotBigIntId = BigInt(slotId);

    // Lấy thông tin Sân đấu
    const sportsPitch = await this.prisma.sportsPitch.findUnique({
      where: { id: pitchId },
      include: { location: true },
    });
    if (!sportsPitch) {
      throw new NotFoundException('Không tìm thấy sân đấu yêu cầu.');
    }

    // Lấy ca đấu (TimeSlot)
    const timeSlot = await this.prisma.timeSlot.findUnique({
      where: { id: slotBigIntId },
    });
    if (!timeSlot) {
      throw new NotFoundException('Không tìm thấy ca đấu yêu cầu.');
    }

    // Kiểm tra xem trùng lịch hay chưa
    const parsedDate = new Date(bookingDate);
    const booked = await this.prisma.booking.findMany({
      where: {
        sportsPitchId: pitchId,
        bookingDate: parsedDate,
        status: { in: ['CONFIRMED', 'PENDING'] },
      },
    });

    const slotStartStr = timeSlot.startTime.toISOString().substring(11, 16);
    const isBooked = booked.some((b) => b.startTime.toISOString().substring(11, 16) === slotStartStr);
    if (isBooked) {
      throw new BadRequestException('Khung giờ này đã được đặt trước. Vui lòng chọn ca đấu khác.');
    }

    // Tính toán thời lượng ca đấu (durationHours)
    const startIso = timeSlot.startTime.toISOString().substring(11, 16);
    const endIso = timeSlot.endTime.toISOString().substring(11, 16);
    const [startH, startM] = startIso.split(':').map(Number);
    const [endH, endM] = endIso.split(':').map(Number);
    const durationHours = (endH * 60 + endM - (startH * 60 + startM)) / 60;

    // Tính toán tiền sân cơ bản
    const basePricePerHour = parseFloat(sportsPitch.basePricePerHour.toString());
    const priceModifier = parseFloat(timeSlot.priceModifier.toString());
    const courtCost = Math.round(basePricePerHour * priceModifier * durationHours);

    // Tính tiền dịch vụ đi kèm
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

    // Tổng phụ trước thuế & giảm giá
    const subtotal = courtCost + serviceCost;
    const vat = Math.round(subtotal * 0.1);
    let totalBeforePromo = subtotal + vat;

    // Tính mã giảm giá
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

    const finalPrice = Math.max(0, totalBeforePromo - discountAmount);

    // Tạo mã code đặt sân ngẫu nhiên
    const bookingCode = 'BKG-' + Math.floor(Math.random() * 900000 + 100000);

    // Xác định trạng thái thanh toán ban đầu
    let paymentStatus = 'UNPAID';
    if (paymentMethod === 'MOMO' || paymentMethod === 'VNPAY') {
      paymentStatus = paymentOption === 'PARTIAL' ? 'PARTIALLY_PAID' : 'PAID';
    }

    // Thực hiện giao dịch lưu database
    const bookingResult = await this.prisma.$transaction(async (tx) => {
      // 1. Tạo Booking
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
          commissionType: 'PERCENTAGE',
          commissionRate: 10,
          commissionAmount: Math.round(finalPrice * 0.1),
          status: 'CONFIRMED', // Giả lập thành công ngay
          paymentStatus,
        },
      });

      // 2. Tạo BookingDetails
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

      // 3. Tạo thanh toán Payment tương ứng
      let payAmount = 0;
      let payType = 'CASH';
      let payStatus = 'PENDING';

      if (paymentMethod === 'MOMO' || paymentMethod === 'VNPAY') {
        payStatus = 'SUCCESS'; // Giả lập thanh toán trực tuyến thành công
        if (paymentOption === 'PARTIAL') {
          payAmount = Math.round(finalPrice * 0.3); // cọc 30%
          payType = 'DEPOSIT';
        } else {
          payAmount = finalPrice; // trả hết 100%
          payType = 'FULL';
        }
      } else if (paymentMethod === 'BANK_TRANSFER') {
        payStatus = 'PENDING'; // Chờ chủ sân kiểm tra bank
        if (paymentOption === 'PARTIAL') {
          payAmount = Math.round(finalPrice * 0.3); // cọc 30%
          payType = 'DEPOSIT';
        } else {
          payAmount = finalPrice; // trả hết 100%
          payType = 'FULL';
        }
      } else {
        // Tiền mặt tại sân
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

      // Nếu áp dụng mã giảm giá, tăng lượt sử dụng
      if (promoId) {
        await tx.promotion.update({
          where: { id: promoId },
          data: { usedCount: { increment: 1 } },
        });
      }

      return newBooking;
    });

    // Lấy đầy đủ thông tin để trả về
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

    return serializeBooking(fullBooking);
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

    return list.map(serializeBooking);
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

    return list.map(serializeBooking);
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

    return serializeBooking(updated);
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

    return list.map(serializeBooking);
  }
}
