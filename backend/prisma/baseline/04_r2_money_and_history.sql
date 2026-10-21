-- ============================================================================
-- R2 - Tiền nong & truy vết:
--   * bookings: tách service_amount, vat_amount, paid_amount
--   * payments: enum phương thức/loại, trường cho cổng thanh toán (provider, raw_response)
--   * promotions: giảm theo % hoặc số tiền cố định, bật/tắt mã
--   * user_promotions -> promotion_redemptions (gắn với đơn, hủy đơn thì trả lượt)
--   * booking_status_history: lịch sử thay đổi trạng thái đơn
-- Chạy trong 1 transaction: lỗi ở bất kỳ bước nào thì không có gì thay đổi.
-- ============================================================================
BEGIN;

CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'MOMO', 'VNPAY');
CREATE TYPE "PaymentType" AS ENUM ('CASH', 'DEPOSIT', 'FULL', 'REFUND');
CREATE TYPE "DiscountType" AS ENUM ('PERCENT', 'FIXED');
CREATE TYPE "RedemptionStatus" AS ENUM ('APPLIED', 'RELEASED');
CREATE TYPE "ActorType" AS ENUM ('USER', 'PARTNER', 'ADMIN', 'SYSTEM');

-- 1. bookings: tách các khoản tiền ------------------------------------------------
ALTER TABLE "bookings"
  ADD COLUMN "service_amount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN "vat_amount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN "paid_amount" DECIMAL(12,2) NOT NULL DEFAULT 0.00;

UPDATE "bookings" AS b
SET "service_amount" = COALESCE((
  SELECT SUM(d."quantity" * d."price") FROM "booking_details" AS d WHERE d."booking_id" = b."id"
), 0);

-- final_price = tiền sân + dịch vụ - giảm giá + VAT  =>  VAT = phần chênh lệch
UPDATE "bookings"
SET "vat_amount" = GREATEST("final_price" - ("base_price" + "service_amount" - "discount_amount"), 0);

-- Số tiền thực thu = các khoản thu thành công - các khoản đã hoàn (payment_type còn là chuỗi ở bước này)
UPDATE "bookings" AS b
SET "paid_amount" = GREATEST(COALESCE((
  SELECT SUM(CASE WHEN UPPER(p."payment_type") = 'REFUND' THEN -p."amount" ELSE p."amount" END)
  FROM "payments" AS p
  WHERE p."booking_id" = b."id" AND p."status" = 'SUCCESS'
), 0), 0);

-- 2. payments: chuỗi -> enum (giữ nguyên dữ liệu) ------------------------------------
UPDATE "payments" SET "payment_method" = UPPER(TRIM("payment_method")) WHERE "payment_method" IS NOT NULL;
UPDATE "payments" SET "payment_method" = NULL
  WHERE "payment_method" NOT IN ('CASH', 'BANK_TRANSFER', 'MOMO', 'VNPAY');
UPDATE "payments" SET "payment_type" = UPPER(TRIM("payment_type"));
UPDATE "payments" SET "payment_type" = 'FULL'
  WHERE "payment_type" NOT IN ('CASH', 'DEPOSIT', 'FULL', 'REFUND');

ALTER TABLE "payments"
  ALTER COLUMN "payment_method" TYPE "PaymentMethod" USING ("payment_method"::"PaymentMethod"),
  ALTER COLUMN "payment_type" TYPE "PaymentType" USING ("payment_type"::"PaymentType"),
  ADD COLUMN "provider" VARCHAR(30),
  ADD COLUMN "raw_response" JSONB;

CREATE UNIQUE INDEX "payments_provider_transaction_id_key" ON "payments"("provider", "transaction_id");

-- 3. promotions -------------------------------------------------------------------
ALTER TABLE "promotions"
  ADD COLUMN "discount_type" "DiscountType" NOT NULL DEFAULT 'PERCENT',
  ADD COLUMN "fixed_discount_amount" DECIMAL(12,2),
  ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;

-- 4. promotion_redemptions (thay user_promotions) -------------------------------------
CREATE TABLE "promotion_redemptions" (
    "id" BIGSERIAL NOT NULL,
    "promotion_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "booking_id" BIGINT,
    "discount_amount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "status" "RedemptionStatus" NOT NULL DEFAULT 'APPLIED',
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "promotion_redemptions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "promotion_redemptions_booking_id_key" ON "promotion_redemptions"("booking_id");
CREATE INDEX "promotion_redemptions_user_id_idx" ON "promotion_redemptions"("user_id");
CREATE UNIQUE INDEX "promotion_redemptions_promotion_id_user_id_key" ON "promotion_redemptions"("promotion_id", "user_id");
ALTER TABLE "promotion_redemptions" ADD CONSTRAINT "promotion_redemptions_promotion_id_fkey"
  FOREIGN KEY ("promotion_id") REFERENCES "promotions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "promotion_redemptions" ADD CONSTRAINT "promotion_redemptions_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "promotion_redemptions" ADD CONSTRAINT "promotion_redemptions_booking_id_fkey"
  FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Chuyển dữ liệu: ưu tiên lần dùng gắn với đơn (đơn còn hiệu lực trước, mới nhất trước),
-- sau đó tới các dòng user_promotions không xác định được đơn.
INSERT INTO "promotion_redemptions"
  ("promotion_id", "user_id", "booking_id", "discount_amount", "status", "created_at", "updated_at")
SELECT DISTINCT ON (x."promotion_id", x."user_id")
  x."promotion_id", x."user_id", x."booking_id", x."discount_amount", x."status", x."created_at", x."created_at"
FROM (
  SELECT b."promo_id" AS "promotion_id", b."user_id", b."id" AS "booking_id", b."discount_amount",
         (CASE WHEN b."status" = 'CANCELLED' THEN 'RELEASED' ELSE 'APPLIED' END)::"RedemptionStatus" AS "status",
         b."created_at", 0 AS "priority"
  FROM "bookings" AS b
  WHERE b."promo_id" IS NOT NULL
  UNION ALL
  SELECT up."promotion_id", up."user_id", NULL, 0, 'APPLIED'::"RedemptionStatus", up."used_at", 1
  FROM "user_promotions" AS up
) AS x
ORDER BY x."promotion_id", x."user_id", x."priority", (x."status" = 'APPLIED') DESC, x."created_at" DESC;

-- Bộ đếm lượt dùng khớp với số lần đang áp dụng
UPDATE "promotions" AS p
SET "used_count" = (SELECT COUNT(*) FROM "promotion_redemptions" AS r WHERE r."promotion_id" = p."id" AND r."status" = 'APPLIED');

DROP TABLE "user_promotions";

-- 5. booking_status_history ---------------------------------------------------------
CREATE TABLE "booking_status_history" (
    "id" BIGSERIAL NOT NULL,
    "booking_id" BIGINT NOT NULL,
    "from_status" "BookingStatus",
    "to_status" "BookingStatus" NOT NULL,
    "from_payment_status" "BookingPaymentStatus",
    "to_payment_status" "BookingPaymentStatus" NOT NULL,
    "actor_type" "ActorType" NOT NULL,
    "actor_id" BIGINT,
    "reason" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "booking_status_history_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "booking_status_history_booking_id_created_at_idx" ON "booking_status_history"("booking_id", "created_at");
ALTER TABLE "booking_status_history" ADD CONSTRAINT "booking_status_history_booking_id_fkey"
  FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Mốc khởi đầu: trạng thái hiện tại của các đơn cũ
INSERT INTO "booking_status_history" ("booking_id", "to_status", "to_payment_status", "actor_type", "reason", "created_at")
SELECT "id", "status", "payment_status", 'SYSTEM', 'Trạng thái tại thời điểm bật lịch sử (dữ liệu cũ)', "updated_at"
FROM "bookings";

-- updated_at do Prisma (@updatedAt) tự gán
ALTER TABLE "promotion_redemptions" ALTER COLUMN "updated_at" DROP DEFAULT;

-- >>> CHECKS (gom vào 0_init)
CREATE OR REPLACE FUNCTION pg_temp.add_check(tbl text, cname text, expr text) RETURNS void AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = cname) THEN
    RETURN;
  END IF;
  EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I CHECK (%s) NOT VALID', tbl, cname, expr);
  BEGIN
    EXECUTE format('ALTER TABLE %I VALIDATE CONSTRAINT %I', tbl, cname);
  EXCEPTION WHEN check_violation THEN
    RAISE WARNING 'Dữ liệu cũ của bảng % vi phạm ràng buộc %. Sửa dữ liệu rồi chạy: ALTER TABLE "%" VALIDATE CONSTRAINT "%";', tbl, cname, tbl, cname;
  END;
END $$ LANGUAGE plpgsql;

SELECT pg_temp.add_check('bookings', 'bookings_breakdown_check',
  'service_amount >= 0 AND vat_amount >= 0 AND paid_amount >= 0');
SELECT pg_temp.add_check('promotions', 'promotions_fixed_check',
  'discount_type <> ''FIXED'' OR (fixed_discount_amount IS NOT NULL AND fixed_discount_amount > 0)');
SELECT pg_temp.add_check('promotion_redemptions', 'promotion_redemptions_discount_check', 'discount_amount >= 0');
-- <<< CHECKS

COMMIT;
