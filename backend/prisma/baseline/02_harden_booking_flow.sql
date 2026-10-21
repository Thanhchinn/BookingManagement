-- ============================================================================
-- Gia cố luồng đặt sân:
--   1. Chuyển các cột trạng thái sang ENUM (DB tự chặn giá trị sai)
--   2. Ràng buộc EXCLUDE chống đặt trùng giờ trên cùng một sân
--   3. Mỗi người dùng chỉ dùng một mã khuyến mãi một lần
-- ============================================================================

-- 1. ENUM trạng thái ------------------------------------------------------------
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "BookingPaymentStatus" AS ENUM ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'REFUNDED');
CREATE TYPE "PaymentTransactionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED');

-- Chuẩn hóa dữ liệu cũ trước khi đổi kiểu (giá trị lạ được đưa về mặc định an toàn)
UPDATE "bookings" SET "status" = UPPER(TRIM("status"));
UPDATE "bookings" SET "status" = 'PENDING'
  WHERE "status" NOT IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');
UPDATE "bookings" SET "payment_status" = UPPER(TRIM("payment_status"));
UPDATE "bookings" SET "payment_status" = 'UNPAID'
  WHERE "payment_status" NOT IN ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'REFUNDED');
UPDATE "payments" SET "status" = UPPER(TRIM("status"));
UPDATE "payments" SET "status" = 'PENDING'
  WHERE "status" NOT IN ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED');

ALTER TABLE "bookings"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "BookingStatus" USING ("status"::"BookingStatus"),
  ALTER COLUMN "status" SET DEFAULT 'PENDING';

ALTER TABLE "bookings"
  ALTER COLUMN "payment_status" DROP DEFAULT,
  ALTER COLUMN "payment_status" TYPE "BookingPaymentStatus" USING ("payment_status"::"BookingPaymentStatus"),
  ALTER COLUMN "payment_status" SET DEFAULT 'UNPAID';

ALTER TABLE "payments"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "PaymentTransactionStatus" USING ("status"::"PaymentTransactionStatus"),
  ALTER COLUMN "status" SET DEFAULT 'PENDING';

CREATE INDEX "bookings_sports_pitch_id_booking_date_status_idx"
  ON "bookings"("sports_pitch_id", "booking_date", "status");

-- 2. Chống đặt trùng giờ ---------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Dữ liệu cũ có thể đã bị đặt trùng (do lỗi race condition trước đây).
-- Duyệt theo thứ tự tạo: giữ đơn tạo trước, tự động hủy đơn tạo sau nếu trùng với đơn vẫn còn hiệu lực.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT "id", "sports_pitch_id", "booking_date", "start_time", "end_time", "created_at"
    FROM "bookings"
    WHERE "status" IN ('PENDING', 'CONFIRMED')
    ORDER BY "created_at", "id"
  LOOP
    IF EXISTS (
      SELECT 1 FROM "bookings" AS o
      WHERE o."status" IN ('PENDING', 'CONFIRMED')
        AND o."id" <> r."id"
        AND o."sports_pitch_id" = r."sports_pitch_id"
        AND o."booking_date" = r."booking_date"
        AND (o."created_at", o."id") < (r."created_at", r."id")
        AND o."start_time" < r."end_time"
        AND o."end_time" > r."start_time"
    ) THEN
      UPDATE "bookings"
      SET "status" = 'CANCELLED',
          "cancellation_reason" = 'Hệ thống tự động hủy do trùng giờ với đơn đặt trước đó.'
      WHERE "id" = r."id";
    END IF;
  END LOOP;
END $$;

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_no_overlap"
  EXCLUDE USING gist (
    "sports_pitch_id" WITH =,
    tsrange("booking_date" + "start_time", "booking_date" + "end_time", '[)') WITH &&
  )
  WHERE ("status" IN ('PENDING', 'CONFIRMED'));

-- 3. Mỗi người dùng chỉ dùng một mã khuyến mãi một lần -------------------------------
DELETE FROM "user_promotions" AS a
USING "user_promotions" AS b
WHERE a."user_id" = b."user_id"
  AND a."promotion_id" = b."promotion_id"
  AND a."id" > b."id";

CREATE UNIQUE INDEX "user_promotions_user_id_promotion_id_key"
  ON "user_promotions"("user_id", "promotion_id");
