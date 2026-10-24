import { BookingStatus, Prisma } from '@prisma/client';

// ============================================================================
// QUY TẮC NGHIỆP VỤ ĐẶT SÂN (dùng chung cho trang hiển thị slot và bước tạo đơn)
// Giờ trong DB (cột TIME/DATE) là giờ địa phương Việt Nam, được Prisma đọc ra dưới dạng UTC.
// ============================================================================

export const ALLOWED_DURATIONS = [1, 1.5, 2]; // Thời lượng thuê cho phép (giờ)
export const DEFAULT_DURATION = 1.5;
export const VAT_RATE = 0.1;
export const DEPOSIT_RATE = 0.3; // Đặt cọc 30%
export const MAX_ADVANCE_DAYS = 60; // Chỉ cho đặt trước tối đa 60 ngày
export const CUSTOMER_CANCEL_CUTOFF_MINUTES = 120; // Khách chỉ được tự hủy trước giờ chơi ít nhất 2 tiếng
export const ACTIVE_BOOKING_STATUSES: BookingStatus[] = [BookingStatus.PENDING, BookingStatus.CONFIRMED]; // Các đơn đang giữ chỗ

const VN_UTC_OFFSET_MS = 7 * 60 * 60 * 1000;
const MINUTES_PER_DAY = 24 * 60;

// Số phút tính từ 00:00 của một giá trị TIME (nếu là endTime 00:00 thì hiểu là 1440 = hết ngày)
export function timeToMinutes(time: Date, isEndTime = false): number {
  const mins = time.getUTCHours() * 60 + time.getUTCMinutes();
  return isEndTime && mins === 0 ? MINUTES_PER_DAY : mins;
}

// Chuyển số phút thành giá trị TIME (1970-01-01T..Z) để lưu vào DB
export function minutesToTime(minutes: number): Date {
  return new Date(Date.UTC(1970, 0, 1, Math.floor(minutes / 60), minutes % 60));
}

export function formatMinutes(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

// Kiểm tra và chuyển chuỗi 'YYYY-MM-DD' thành Date (00:00 UTC). Trả null nếu sai định dạng.
export function parseBookingDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  if (isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
  return date;
}

// Thời điểm hiện tại theo giờ Việt Nam, biểu diễn như "giờ treo tường" trong UTC để so sánh với dữ liệu DB
export function nowInVietnam(): Date {
  return new Date(Date.now() + VN_UTC_OFFSET_MS);
}

// Thời điểm bắt đầu ca đấu (giờ treo tường VN, dạng UTC)
export function bookingStartAt(bookingDate: Date, startTime: Date): Date {
  return new Date(bookingDate.getTime() + timeToMinutes(startTime) * 60 * 1000);
}

export function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && aEnd > bStart;
}

// Số đơn đang giữ chỗ (PENDING/CONFIRMED) từ hôm nay trở đi thỏa điều kiện `where`.
// Dùng để chặn xóa sân/cơ sở/người dùng khi khách vẫn còn lịch sắp tới.
export async function countUpcomingBookings(
  db: { booking: { count(args: { where: Prisma.BookingWhereInput }): Promise<number> } },
  where: Prisma.BookingWhereInput,
): Promise<number> {
  const today = new Date(nowInVietnam().toISOString().slice(0, 10) + 'T00:00:00Z');
  return db.booking.count({
    where: { ...where, status: { in: ACTIVE_BOOKING_STATUSES }, bookingDate: { gte: today } },
  });
}

export function isAllowedDuration(duration: number): boolean {
  return ALLOWED_DURATIONS.includes(duration);
}

interface SlotLike {
  startTime: Date;
  endTime: Date;
  priceModifier: Prisma.Decimal;
  isAvailable: boolean;
}

interface OverrideLike {
  startTime: Date | null;
  endTime: Date | null;
  priceModifier: Prisma.Decimal;
  isClosed: boolean;
  reason: string | null;
}

export interface SlotEvaluation {
  startMinutes: number;
  endMinutes: number;
  priceModifier: Prisma.Decimal;
  unavailableReason: string | null;
  // 'hours': ngoài giờ mở cửa (không hiển thị); 'closed': sân tạm đóng theo lịch đặc biệt (hiển thị nhưng khóa)
  unavailableKind: 'hours' | 'closed' | null;
}

// Khoảng thời gian [start, end) của một override (null = cả ngày / đến hết ngày)
function overrideRange(o: OverrideLike): [number, number] {
  const start = o.startTime ? timeToMinutes(o.startTime) : 0;
  const end = o.endTime ? timeToMinutes(o.endTime) : MINUTES_PER_DAY;
  return [start, end];
}

// Đánh giá một ca đấu bắt đầu tại `slot` và kéo dài `durationHours` giờ:
// - Toàn bộ khoảng thời gian phải nằm trong các khung giờ mở cửa (isAvailable) của ngày đó, không có khoảng trống
// - Không trùng với lịch đóng cửa đặc biệt (SlotOverride.isClosed)
// - Hệ số giá lấy từ override (nếu có) hoặc từ khung giờ bắt đầu
export function evaluateSlot(
  slot: SlotLike,
  daySlots: SlotLike[],
  overrides: OverrideLike[],
  durationHours: number,
): SlotEvaluation {
  const startMinutes = timeToMinutes(slot.startTime);
  const endMinutes = startMinutes + Math.round(durationHours * 60);
  let priceModifier = slot.priceModifier;

  const result = (reason: string | null, kind: SlotEvaluation['unavailableKind'] = null): SlotEvaluation => ({
    startMinutes,
    endMinutes,
    priceModifier,
    unavailableReason: reason,
    unavailableKind: kind,
  });

  if (!slot.isAvailable) {
    return result('Khung giờ này hiện không mở cho đặt sân.', 'hours');
  }
  if (endMinutes > MINUTES_PER_DAY) {
    return result('Ca đấu không được kéo dài qua nửa đêm.', 'hours');
  }

  // Kiểm tra khoảng [start, end) được phủ kín bởi các khung giờ mở cửa
  const openRanges = daySlots
    .filter((s) => s.isAvailable)
    .map((s) => {
      const s0 = timeToMinutes(s.startTime);
      const e0 = timeToMinutes(s.endTime);
      return [s0, e0 <= s0 ? MINUTES_PER_DAY : e0] as [number, number]; // Khung kết thúc 00:00 = hết ngày
    })
    .sort((a, b) => a[0] - b[0]);
  let coveredUntil = startMinutes;
  for (const [s, e] of openRanges) {
    if (s > coveredUntil) break;
    if (e > coveredUntil) coveredUntil = e;
    if (coveredUntil >= endMinutes) break;
  }
  if (coveredUntil < endMinutes) {
    return result('Ca đấu vượt quá giờ mở cửa của sân.', 'hours');
  }

  // Lịch đóng cửa / giá đặc biệt theo ngày
  for (const o of overrides) {
    const [oStart, oEnd] = overrideRange(o);
    if (o.isClosed && rangesOverlap(startMinutes, endMinutes, oStart, oEnd)) {
      return result(`Sân tạm ngưng phục vụ${o.reason ? `: ${o.reason}` : '.'}`, 'closed');
    }
  }
  // Ưu tiên override theo giờ cụ thể, sau đó tới override cả ngày
  const priceOverride =
    overrides.find((o) => !o.isClosed && o.startTime && timeToMinutes(o.startTime) === startMinutes) ??
    overrides.find((o) => !o.isClosed && !o.startTime);
  if (priceOverride) {
    priceModifier = priceOverride.priceModifier;
  }

  return result(null);
}

export interface PricingInput {
  basePricePerHour: Prisma.Decimal;
  priceModifier: Prisma.Decimal;
  durationHours: number;
  products: { price: Prisma.Decimal; quantity: number }[];
  promotion?: {
    discountType: 'PERCENT' | 'FIXED';
    discountPercent: Prisma.Decimal;
    fixedDiscountAmount: Prisma.Decimal | null;
    maxDiscountAmount: Prisma.Decimal | null;
  } | null;
}

export interface PricingResult {
  courtCost: Prisma.Decimal;
  serviceCost: Prisma.Decimal;
  subtotal: Prisma.Decimal;
  discountAmount: Prisma.Decimal;
  vat: Prisma.Decimal;
  finalPrice: Prisma.Decimal;
}

// Làm tròn về đồng (VND không có phần lẻ)
function roundVnd(value: Prisma.Decimal): Prisma.Decimal {
  return value.toDecimalPlaces(0, Prisma.Decimal.ROUND_HALF_UP);
}

// Tính tiền bằng Decimal để tránh sai số dấu phẩy động.
// Thứ tự: tiền sân + dịch vụ -> trừ khuyến mãi -> cộng VAT 10% trên phần còn lại.
export function calculatePricing(input: PricingInput): PricingResult {
  const courtCost = roundVnd(input.basePricePerHour.mul(input.priceModifier).mul(input.durationHours));
  const serviceCost = input.products.reduce(
    (sum, p) => sum.add(p.price.mul(p.quantity)),
    new Prisma.Decimal(0),
  );
  const subtotal = courtCost.add(serviceCost);

  let discountAmount = new Prisma.Decimal(0);
  if (input.promotion) {
    discountAmount =
      input.promotion.discountType === 'FIXED'
        ? (input.promotion.fixedDiscountAmount ?? new Prisma.Decimal(0))
        : roundVnd(subtotal.mul(input.promotion.discountPercent).div(100));
    if (input.promotion.maxDiscountAmount && discountAmount.gt(input.promotion.maxDiscountAmount)) {
      discountAmount = input.promotion.maxDiscountAmount;
    }
    discountAmount = Prisma.Decimal.min(discountAmount, subtotal); // Không giảm quá giá trị đơn
  }

  const taxable = Prisma.Decimal.max(subtotal.sub(discountAmount), 0);
  const vat = roundVnd(taxable.mul(VAT_RATE));
  const finalPrice = taxable.add(vat);

  return { courtCost, serviceCost, subtotal, discountAmount, vat, finalPrice };
}
