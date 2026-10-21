import { Injectable, BadRequestException, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { postLedgerEntry } from '../partners/partner-ledger';
import {
  ActorType,
  LedgerEntryType,
  BookingPaymentStatus,
  BookingStatus,
  PaymentMethod,
  PaymentTransactionStatus,
  PaymentType,
  Prisma,
  RedemptionStatus,
} from '@prisma/client';
import { randomInt } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser, isAdminRole, USER_ROLE } from '../auth/auth.constants';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { CreateBookingDto, QuoteBookingDto } from './dto/create-booking.dto';
import {
  ACTIVE_BOOKING_STATUSES,
  ALLOWED_DURATIONS,
  bookingStartAt,
  calculatePricing,
  CUSTOMER_CANCEL_CUTOFF_MINUTES,
  DEFAULT_DURATION,
  DEPOSIT_RATE,
  evaluateSlot,
  formatMinutes,
  isAllowedDuration,
  MAX_ADVANCE_DAYS,
  minutesToTime,
  nowInVietnam,
  parseBookingDate,
  rangesOverlap,
  timeToMinutes,
} from './booking-rules';

type Db = PrismaService | Prisma.TransactionClient;

const OVERLAP_MESSAGE = 'Khung giờ này đã có người đặt hoặc trùng với một lịch đặt khác. Vui lòng chọn ca khác.';

// Mã đơn ngẫu nhiên, bỏ các ký tự dễ nhầm (0/O, 1/I)
function generateBookingCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += alphabet[randomInt(alphabet.length)];
  return `BKG-${code}`;
}

// Số tiền thực thu = các khoản thu thành công - các khoản hoàn tiền thành công
function netPaidAmount(payments: { amount: Prisma.Decimal; status: PaymentTransactionStatus; paymentType: PaymentType }[]) {
  return payments
    .filter((p) => p.status === PaymentTransactionStatus.SUCCESS)
    .reduce((sum, p) => (p.paymentType === PaymentType.REFUND ? sum.sub(p.amount) : sum.add(p.amount)), new Prisma.Decimal(0));
}

// Lỗi vi phạm ràng buộc EXCLUDE "bookings_no_overlap" (SQLSTATE 23P01)
function isOverlapViolation(err: unknown): boolean {
  let text = String((err as any)?.message ?? '');
  try {
    text += JSON.stringify(err, (_k, v) => (typeof v === 'bigint' ? v.toString() : v));
  } catch {
    // bỏ qua lỗi tuần tự hóa
  }
  return text.includes('bookings_no_overlap') || text.includes('23P01');
}

// Các bước chuyển trạng thái hợp lệ của đơn đặt sân
const BOOKING_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  // Tách slotId dạng "<timeSlotId>_<thời lượng>" (thời lượng mặc định 1.5 giờ)
  private parseSlotId(slotId: string): { timeSlotId: bigint; durationHours: number } {
    const [idPart, durPart] = slotId.split('_');
    if (!/^\d+$/.test(idPart ?? '')) {
      throw new BadRequestException('Mã ca đấu không hợp lệ.');
    }
    const durationHours = durPart === undefined ? DEFAULT_DURATION : Number(durPart);
    if (!isAllowedDuration(durationHours)) {
      throw new BadRequestException(`Thời lượng thuê không hợp lệ (chỉ hỗ trợ ${ALLOWED_DURATIONS.join(', ')} giờ).`);
    }
    return { timeSlotId: BigInt(idPart), durationHours };
  }

  // Kiểm tra mã khuyến mãi; ném lỗi rõ ràng thay vì âm thầm bỏ qua (tránh khách thấy giá khác với giá bị tính)
  private async resolvePromotion(
    db: Db,
    promoCode: string | undefined,
    userId: bigint,
    partnerId: bigint,
    subtotal: Prisma.Decimal,
  ) {
    const code = promoCode?.trim();
    if (!code) return null;

    const promotion = await db.promotion.findFirst({
      where: { code: { equals: code, mode: 'insensitive' } },
    });
    if (!promotion || !promotion.isActive) {
      throw new BadRequestException('Mã khuyến mãi không tồn tại hoặc đã ngừng áp dụng.');
    }
    if (promotion.partnerId && promotion.partnerId !== partnerId) {
      throw new BadRequestException('Mã khuyến mãi không áp dụng cho cơ sở này.');
    }
    const now = new Date();
    if (now < promotion.startDate || now > promotion.endDate) {
      throw new BadRequestException('Mã khuyến mãi chưa bắt đầu hoặc đã hết hạn.');
    }
    if (promotion.usageLimit > 0 && promotion.usedCount >= promotion.usageLimit) {
      throw new BadRequestException('Mã khuyến mãi đã hết lượt sử dụng.');
    }
    if (subtotal.lt(promotion.minOrderValue)) {
      throw new BadRequestException(
        `Đơn hàng cần tối thiểu ${promotion.minOrderValue.toNumber().toLocaleString('vi-VN')}đ để dùng mã này.`,
      );
    }
    const used = await db.promotionRedemption.findUnique({
      where: { promotionId_userId: { promotionId: promotion.id, userId } },
    });
    if (used?.status === RedemptionStatus.APPLIED) {
      throw new BadRequestException('Bạn đã sử dụng mã khuyến mãi này trước đó.');
    }
    return promotion;
  }

  // Xác thực toàn bộ thông tin đặt sân và tính giá (không ghi DB). Dùng chung cho báo giá và tạo đơn.
  private async prepareBooking(userId: bigint, dto: QuoteBookingDto, db: Db = this.prisma) {
    const bookingDate = parseBookingDate(dto.bookingDate);
    if (!bookingDate) {
      throw new BadRequestException('Ngày đặt sân không hợp lệ.');
    }

    // 1. Sân, cơ sở và đối tác đều phải đang hoạt động
    if (!/^\d+$/.test(dto.sportsPitchId)) {
      throw new BadRequestException('Mã sân không hợp lệ.');
    }
    const pitchId = BigInt(dto.sportsPitchId);
    const sportsPitch = await db.sportsPitch.findUnique({
      where: { id: pitchId },
      include: { location: { include: { partner: true } } },
    });
    if (
      !sportsPitch ||
      sportsPitch.deletedAt ||
      !sportsPitch.isActive ||
      sportsPitch.location.deletedAt ||
      !sportsPitch.location.isActive
    ) {
      throw new NotFoundException('Không tìm thấy sân đấu hoặc sân đang tạm ngưng hoạt động.');
    }
    const partner = sportsPitch.location.partner;
    if (partner.status.toUpperCase() !== 'ACTIVE') {
      throw new BadRequestException('Cơ sở này hiện không nhận đặt sân.');
    }

    // 2. Ca đấu phải thuộc đúng sân và đúng thứ trong tuần của ngày đặt
    const { timeSlotId, durationHours } = this.parseSlotId(dto.slotId);
    const timeSlot = await db.timeSlot.findUnique({ where: { id: timeSlotId } });
    if (!timeSlot || timeSlot.sportsPitchId !== pitchId) {
      throw new NotFoundException('Không tìm thấy ca đấu của sân này.');
    }
    if (timeSlot.dayOfWeek !== bookingDate.getUTCDay()) {
      throw new BadRequestException('Ca đấu không áp dụng cho ngày đã chọn.');
    }

    const [daySlots, overrides] = await Promise.all([
      db.timeSlot.findMany({ where: { sportsPitchId: pitchId, dayOfWeek: timeSlot.dayOfWeek } }),
      db.slotOverride.findMany({ where: { sportsPitchId: pitchId, overrideDate: bookingDate } }),
    ]);
    const evaluation = evaluateSlot(timeSlot, daySlots, overrides, durationHours);
    if (evaluation.unavailableReason) {
      throw new BadRequestException(evaluation.unavailableReason);
    }

    // 3. Không đặt giờ đã qua, không đặt quá xa
    const startAt = bookingStartAt(bookingDate, minutesToTime(evaluation.startMinutes));
    const now = nowInVietnam();
    if (startAt <= now) {
      throw new BadRequestException('Không thể đặt khung giờ đã qua.');
    }
    if (startAt.getTime() - now.getTime() > MAX_ADVANCE_DAYS * 24 * 60 * 60 * 1000) {
      throw new BadRequestException(`Chỉ có thể đặt sân trước tối đa ${MAX_ADVANCE_DAYS} ngày.`);
    }

    // 4. Sản phẩm bán kèm phải thuộc cùng cơ sở và đang được bán (gộp các dòng trùng sản phẩm)
    const quantities = new Map<string, number>();
    for (const item of dto.products ?? []) {
      if (!/^\d+$/.test(item.productId)) {
        throw new BadRequestException('Mã sản phẩm không hợp lệ.');
      }
      quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
    }
    const productRows = quantities.size
      ? await db.product.findMany({ where: { id: { in: [...quantities.keys()].map((id) => BigInt(id)) } } })
      : [];
    const products = [...quantities.entries()].map(([productId, quantity]) => {
      const product = productRows.find((p) => p.id.toString() === productId);
      if (!product || product.deletedAt || product.locationId !== sportsPitch.locationId || !product.isAvailable) {
        throw new BadRequestException('Có sản phẩm không thuộc cơ sở này hoặc đã ngừng bán.');
      }
      return { productId: product.id, productName: product.name, price: product.price, quantity };
    });

    // 5. Tính giá (chưa khuyến mãi) để kiểm tra điều kiện mã, sau đó tính giá cuối cùng
    const pricingInput = {
      basePricePerHour: sportsPitch.basePricePerHour,
      priceModifier: evaluation.priceModifier,
      durationHours,
      products,
    };
    const { subtotal } = calculatePricing(pricingInput);
    const promotion = await this.resolvePromotion(db, dto.promoCode, userId, partner.id, subtotal);
    const pricing = calculatePricing({ ...pricingInput, promotion });

    return {
      sportsPitch,
      partner,
      pitchId,
      bookingDate,
      startMinutes: evaluation.startMinutes,
      endMinutes: evaluation.endMinutes,
      durationHours,
      products,
      promotion,
      pricing,
    };
  }

  // Chặn trùng giờ với các đơn đang giữ chỗ (PENDING/CONFIRMED) trên cùng sân
  private async assertNoOverlap(db: Db, pitchId: bigint, bookingDate: Date, startMinutes: number, endMinutes: number) {
    const booked = await db.booking.findMany({
      where: {
        sportsPitchId: pitchId,
        bookingDate,
        status: { in: ACTIVE_BOOKING_STATUSES },
      },
      select: { startTime: true, endTime: true },
    });
    const isBooked = booked.some((b) =>
      rangesOverlap(startMinutes, endMinutes, timeToMinutes(b.startTime), timeToMinutes(b.endTime)),
    );
    if (isBooked) {
      throw new ConflictException(OVERLAP_MESSAGE);
    }
  }

  // 0. Báo giá trước khi đặt (dùng để kiểm tra mã khuyến mãi và hiển thị đúng số tiền sẽ bị tính)
  async quoteBooking(userIdStr: string, dto: QuoteBookingDto) {
    const userId = BigInt(userIdStr);
    const prepared = await this.prepareBooking(userId, dto);
    await this.assertNoOverlap(this.prisma, prepared.pitchId, prepared.bookingDate, prepared.startMinutes, prepared.endMinutes);

    const { pricing, promotion } = prepared;
    return {
      startTime: formatMinutes(prepared.startMinutes),
      endTime: formatMinutes(prepared.endMinutes),
      durationHours: prepared.durationHours,
      courtCost: pricing.courtCost.toNumber(),
      serviceCost: pricing.serviceCost.toNumber(),
      subtotal: pricing.subtotal.toNumber(),
      discountAmount: pricing.discountAmount.toNumber(),
      vat: pricing.vat.toNumber(),
      finalPrice: pricing.finalPrice.toNumber(),
      promotion: promotion
        ? {
            code: promotion.code,
            discountType: promotion.discountType,
            discountPercent: promotion.discountPercent.toNumber(),
            fixedDiscountAmount: promotion.fixedDiscountAmount?.toNumber() ?? null,
            maxDiscountAmount: promotion.maxDiscountAmount?.toNumber() ?? null,
            minOrderValue: promotion.minOrderValue.toNumber(),
          }
        : null,
    };
  }

  // 1. Tạo mới một booking
  async createBooking(userIdStr: string, dto: CreateBookingDto) {
    const userId = BigInt(userIdStr);
    const prepared = await this.prepareBooking(userId, dto);
    const { pricing, promotion, partner } = prepared;

    // Hình thức thanh toán: tiền mặt trả tại sân; chuyển khoản trả đủ hoặc cọc 30%
    const isCash = dto.paymentMethod === 'CASH';
    if (!isCash && dto.paymentOption === 'CASH') {
      throw new BadRequestException('Chuyển khoản phải chọn thanh toán toàn bộ hoặc đặt cọc.');
    }
    const isDeposit = !isCash && dto.paymentOption === 'PARTIAL';
    const payAmount = isCash
      ? new Prisma.Decimal(0)
      : isDeposit
        ? pricing.finalPrice.mul(DEPOSIT_RATE).toDecimalPlaces(0, Prisma.Decimal.ROUND_HALF_UP)
        : pricing.finalPrice;

    // Hoa hồng nền tảng theo cấu hình của đối tác
    const commissionType = partner.commissionType || 'PERCENTAGE';
    const commissionRate = commissionType === 'PERCENTAGE' ? partner.commissionRate : null;
    const commissionFixedAmount = commissionType === 'PERCENTAGE' ? null : partner.commissionFixedAmount;
    const commissionAmount = commissionRate
      ? pricing.finalPrice.mul(commissionRate).div(100).toDecimalPlaces(0, Prisma.Decimal.ROUND_HALF_UP)
      : (commissionFixedAmount ?? new Prisma.Decimal(0));

    let bookingId: bigint;
    try {
      bookingId = await this.prisma.$transaction(async (tx) => {
        // Khóa dòng sân để các yêu cầu đặt cùng sân được xử lý tuần tự
        await tx.$queryRaw`SELECT id FROM sports_pitches WHERE id = ${prepared.pitchId} FOR UPDATE`;
        await this.assertNoOverlap(tx, prepared.pitchId, prepared.bookingDate, prepared.startMinutes, prepared.endMinutes);

        if (promotion) {
          // Tăng lượt dùng có điều kiện để không vượt giới hạn khi nhiều người dùng cùng lúc
          const updated = await tx.$executeRaw`
            UPDATE promotions SET used_count = used_count + 1
            WHERE id = ${promotion.id} AND (usage_limit = 0 OR used_count < usage_limit)`;
          if (updated === 0) {
            throw new BadRequestException('Mã khuyến mãi đã hết lượt sử dụng.');
          }
        }

        const newBooking = await tx.booking.create({
          data: {
            bookingCode: generateBookingCode(),
            userId,
            sportsPitchId: prepared.pitchId,
            promoId: promotion?.id ?? null,
            bookingDate: prepared.bookingDate,
            startTime: minutesToTime(prepared.startMinutes),
            endTime: minutesToTime(prepared.endMinutes),
            basePrice: pricing.courtCost,
            serviceAmount: pricing.serviceCost,
            discountAmount: pricing.discountAmount,
            vatAmount: pricing.vat,
            finalPrice: pricing.finalPrice,
            commissionType,
            commissionRate,
            commissionFixedAmount,
            commissionAmount,
            // Tiền mặt: giữ chỗ ngay; chuyển khoản: chờ chủ sân xác nhận đã nhận tiền
            status: isCash ? BookingStatus.CONFIRMED : BookingStatus.PENDING,
            paymentStatus: BookingPaymentStatus.UNPAID,
            bookingDetails: {
              create: prepared.products.map((p) => ({
                productId: p.productId,
                productName: p.productName,
                quantity: p.quantity,
                price: p.price,
              })),
            },
            payments: {
              create: {
                amount: payAmount,
                paymentMethod: dto.paymentMethod as PaymentMethod,
                paymentType: isCash ? PaymentType.CASH : isDeposit ? PaymentType.DEPOSIT : PaymentType.FULL,
                status: PaymentTransactionStatus.PENDING,
              },
            },
            statusHistory: {
              create: {
                toStatus: isCash ? BookingStatus.CONFIRMED : BookingStatus.PENDING,
                toPaymentStatus: BookingPaymentStatus.UNPAID,
                actorType: ActorType.USER,
                actorId: userId,
                reason: 'Khách đặt sân',
              },
            },
          },
        });

        if (promotion) {
          // Ghi nhận lượt dùng mã gắn với đơn (dùng lại dòng cũ nếu lượt trước đã được trả)
          await tx.promotionRedemption.upsert({
            where: { promotionId_userId: { promotionId: promotion.id, userId } },
            create: { promotionId: promotion.id, userId, bookingId: newBooking.id, discountAmount: pricing.discountAmount },
            update: { bookingId: newBooking.id, discountAmount: pricing.discountAmount, status: RedemptionStatus.APPLIED },
          });
        }
        return newBooking.id;
      });
    } catch (err) {
      if (isOverlapViolation(err)) {
        throw new ConflictException(OVERLAP_MESSAGE);
      }
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Bạn đã sử dụng mã khuyến mãi này trước đó.');
      }
      throw err;
    }

    // Trả về đơn đầy đủ thông tin
    return this.prisma.booking.findUnique({
      where: { id: bookingId },
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
        archivedAt: null,
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

  // Xác định vai trò của người thao tác đối với đơn: Admin, Chủ sân sở hữu đơn, hay Khách đặt đơn.
  // Lưu ý: ID admin và ID user thuộc 2 bảng khác nhau nên phải phân biệt bằng role, không so ID chéo bảng.
  private async resolveBookingActor(requester: AuthUser, booking: { userId: bigint; sportsPitch: { location: { partnerId: bigint } } }) {
    if (isAdminRole(requester.role)) {
      return { isAdmin: true, isOwnerPartner: false, isOwnerUser: false };
    }
    if (requester.role !== USER_ROLE) {
      return { isAdmin: false, isOwnerPartner: false, isOwnerUser: false };
    }
    const userId = BigInt(requester.userId);
    const partnerProfile = await this.prisma.partnerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    return {
      isAdmin: false,
      isOwnerPartner: !!partnerProfile && booking.sportsPitch.location.partnerId === partnerProfile.id,
      isOwnerUser: booking.userId === userId,
    };
  }

  // 4. Phê duyệt/Hủy đặt sân / Hoàn tiền
  async updateStatus(requester: AuthUser, bookingIdStr: string, dto: UpdateBookingStatusDto) {
    const { status, paymentStatus, cancellationReason } = dto;
    const bookingId = BigInt(bookingIdStr);

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

    const { isAdmin, isOwnerPartner, isOwnerUser } = await this.resolveBookingActor(requester, booking);
    const canManage = isAdmin || isOwnerPartner;

    if (!canManage && !isOwnerUser) {
      throw new ForbiddenException('Bạn không có quyền thay đổi trạng thái đơn đặt sân này.');
    }

    // Khách hàng chỉ được phép tự hủy đơn của mình (trước giờ chơi), không được đổi trạng thái thanh toán
    if (!canManage) {
      if (paymentStatus !== undefined || (status !== undefined && status !== 'CANCELLED')) {
        throw new ForbiddenException('Bạn chỉ có thể hủy đơn đặt sân của mình.');
      }
      const startAt = bookingStartAt(booking.bookingDate, booking.startTime);
      const minutesLeft = (startAt.getTime() - nowInVietnam().getTime()) / 60000;
      if (status === 'CANCELLED' && minutesLeft < CUSTOMER_CANCEL_CUTOFF_MINUTES) {
        throw new ForbiddenException(
          `Chỉ có thể tự hủy trước giờ chơi ít nhất ${CUSTOMER_CANCEL_CUTOFF_MINUTES / 60} tiếng. Vui lòng liên hệ chủ sân.`,
        );
      }
    }

    // Kiểm tra bước chuyển trạng thái hợp lệ
    if (status && status !== booking.status) {
      const allowed = BOOKING_TRANSITIONS[booking.status] ?? [];
      if (!allowed.includes(status)) {
        throw new BadRequestException(`Không thể chuyển đơn từ trạng thái ${booking.status} sang ${status}.`);
      }
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

    const newPaymentStatus: string = dataToUpdate.paymentStatus ?? booking.paymentStatus;

    return this.prisma.$transaction(async (tx) => {
      // Đồng bộ các bản ghi thanh toán với trạng thái mới của đơn (giữ nguyên lịch sử giao dịch)
      if (newPaymentStatus === 'PAID' || newPaymentStatus === 'PARTIALLY_PAID') {
        // Chủ sân xác nhận đã nhận tiền
        await tx.payment.updateMany({
          where: { bookingId, status: PaymentTransactionStatus.PENDING },
          data: { status: PaymentTransactionStatus.SUCCESS },
        });
      }
      if (status === 'CANCELLED' || newPaymentStatus === 'REFUNDED') {
        // Khoản chưa thanh toán thì hủy
        await tx.payment.updateMany({
          where: { bookingId, status: PaymentTransactionStatus.PENDING },
          data: { status: PaymentTransactionStatus.CANCELLED },
        });
      }
      if (newPaymentStatus === 'REFUNDED' && booking.paymentStatus !== 'REFUNDED') {
        // Khoản đã thu thì ghi nhận một giao dịch hoàn tiền riêng
        const paid = netPaidAmount(await tx.payment.findMany({ where: { bookingId } }));
        if (paid.gt(0)) {
          await tx.payment.create({
            data: {
              bookingId,
              amount: paid,
              paymentMethod: booking.payments[0]?.paymentMethod ?? null,
              paymentType: PaymentType.REFUND,
              status: PaymentTransactionStatus.SUCCESS,
            },
          });
        }
      }

      // Số tiền thực thu sau khi đồng bộ các giao dịch
      dataToUpdate.paidAmount = netPaidAmount(await tx.payment.findMany({ where: { bookingId } }));

      // Hủy đơn thì trả lại lượt dùng mã khuyến mãi
      if (status === 'CANCELLED' && booking.status !== 'CANCELLED') {
        const redemption = await tx.promotionRedemption.findUnique({ where: { bookingId } });
        if (redemption?.status === RedemptionStatus.APPLIED) {
          await tx.promotionRedemption.update({
            where: { id: redemption.id },
            data: { status: RedemptionStatus.RELEASED },
          });
          await tx.$executeRaw`
            UPDATE promotions SET used_count = GREATEST(used_count - 1, 0) WHERE id = ${redemption.promotionId}`;
        }
      }

      // Lịch sử trạng thái: ai đổi, đổi gì
      const toStatus = (dataToUpdate.status ?? booking.status) as BookingStatus;
      const toPaymentStatus = newPaymentStatus as BookingPaymentStatus;

      // Sổ cái hoa hồng: hoàn thành -> ghi nợ hoa hồng; đơn đã hoàn thành bị hoàn tiền -> hoàn lại hoa hồng
      const partnerId = booking.sportsPitch.location.partnerId;
      if (toStatus === BookingStatus.COMPLETED && booking.status !== BookingStatus.COMPLETED && booking.commissionAmount.gt(0)) {
        await postLedgerEntry(tx, {
          partnerId,
          bookingId,
          type: LedgerEntryType.COMMISSION_CHARGE,
          amount: booking.commissionAmount,
          note: `Hoa hồng đơn ${booking.bookingCode}`,
        });
      }
      if (toPaymentStatus === BookingPaymentStatus.REFUNDED && booking.paymentStatus !== BookingPaymentStatus.REFUNDED) {
        const charge = await tx.partnerLedgerEntry.findUnique({
          where: { bookingId_type: { bookingId, type: LedgerEntryType.COMMISSION_CHARGE } },
        });
        if (charge) {
          await postLedgerEntry(tx, {
            partnerId,
            bookingId,
            type: LedgerEntryType.COMMISSION_REVERSAL,
            amount: charge.amount.neg(),
            note: `Hoàn hoa hồng do đơn ${booking.bookingCode} được hoàn tiền`,
          });
        }
      }
      if (toStatus !== booking.status || toPaymentStatus !== booking.paymentStatus) {
        await tx.bookingStatusHistory.create({
          data: {
            bookingId,
            fromStatus: booking.status,
            toStatus,
            fromPaymentStatus: booking.paymentStatus,
            toPaymentStatus,
            actorType: isAdmin ? ActorType.ADMIN : isOwnerPartner ? ActorType.PARTNER : ActorType.USER,
            actorId: BigInt(requester.userId),
            reason: dataToUpdate.cancellationReason ?? null,
          },
        });
      }

      return tx.booking.update({
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
    });
  }

  // Lịch sử trạng thái đơn
  async getStatusHistory(requester: AuthUser, bookingIdStr: string) {
    const bookingId = BigInt(bookingIdStr);
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { sportsPitch: { include: { location: true } } },
    });
    if (!booking) {
      throw new NotFoundException('Không tìm thấy đơn đặt sân.');
    }
    const { isAdmin, isOwnerPartner, isOwnerUser } = await this.resolveBookingActor(requester, booking);
    if (!isAdmin && !isOwnerPartner && !isOwnerUser) {
      throw new ForbiddenException('Bạn không có quyền xem lịch sử đơn đặt sân này.');
    }
    return this.prisma.bookingStatusHistory.findMany({
      where: { bookingId },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });
  }

  // 5. Lấy danh sách toàn bộ đặt sân dành cho Admin (quyền Admin được kiểm tra ở controller)
  async getAdminBookings() {
    const list = await this.prisma.booking.findMany({
      where: { archivedAt: null },
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

  // 6. "Xóa" (ẩn) lịch đặt khi đã bị hủy (Chủ sân/Đối tác hoặc Admin)
  async deleteBooking(requester: AuthUser, bookingIdStr: string) {
    const bookingId = BigInt(bookingIdStr);

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

    const { isAdmin, isOwnerPartner } = await this.resolveBookingActor(requester, booking);

    if (!isOwnerPartner && !isAdmin) {
      throw new ForbiddenException('Bạn không có quyền xóa lịch đặt này.');
    }

    if (booking.status !== 'CANCELLED') {
      throw new BadRequestException('Chỉ có thể xóa lịch đặt khi trạng thái là ĐÃ HỦY (CANCELLED).');
    }

    // Không xóa cứng (giữ lịch sử thanh toán/hoàn tiền): chỉ ẩn khỏi danh sách quản lý.
    // Khách hàng vẫn thấy đơn đã hủy trong lịch sử của mình.
    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { archivedAt: new Date() },
    });

    return { message: 'Đã xóa lịch đặt thành công.' };
  }
}
