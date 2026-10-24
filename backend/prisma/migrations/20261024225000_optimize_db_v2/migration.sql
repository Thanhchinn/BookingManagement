-- ============================================================================
-- MIGRATION: OPTIMIZE DB V2.0 (SENIOR BA & ARCHITECT ENHANCEMENTS)
-- ============================================================================

-- 1. Enums mới & mở rộng Enum BookingStatus
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'EXPIRED';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BookingSource') THEN
    CREATE TYPE "BookingSource" AS ENUM ('ONLINE', 'WALK_IN', 'PHONE');
  END IF;
END $$;

-- 2. Tạo bảng booking_groups (Hỗ trợ đặt sân định kỳ theo tháng hoặc đặt nhiều sân trong 1 lần thanh toán)
CREATE TABLE IF NOT EXISTS "booking_groups" (
    "id" BIGSERIAL NOT NULL,
    "group_code" VARCHAR(20) NOT NULL,
    "user_id" BIGINT,
    "guest_name" VARCHAR(255),
    "guest_phone" VARCHAR(20),
    "total_bookings_count" INTEGER NOT NULL DEFAULT 1,
    "total_amount" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "paid_amount" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "note" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_groups_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "booking_groups_group_code_key" ON "booking_groups"("group_code");
CREATE INDEX IF NOT EXISTS "booking_groups_user_id_idx" ON "booking_groups"("user_id");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'booking_groups_user_id_fkey') THEN
    ALTER TABLE "booking_groups"
      ADD CONSTRAINT "booking_groups_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- 3. Nâng cấp bảng locations & sports_pitches (Cache Rating & Composite Ward-Province Key)
ALTER TABLE "locations"
  ADD COLUMN IF NOT EXISTS "rating_avg" DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS "rating_count" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "sports_pitches"
  ADD COLUMN IF NOT EXISTS "rating_avg" DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS "rating_count" INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS "location_wards_province_code_ward_code_key"
  ON "location_wards"("province_code", "ward_code");

-- Đồng bộ dữ liệu rating_avg và rating_count từ bảng reviews hiện có
UPDATE "sports_pitches" sp
SET
  "rating_count" = sub.cnt,
  "rating_avg" = sub.avg_rating
FROM (
  SELECT "sports_pitch_id", COUNT(*)::int AS cnt, COALESCE(ROUND(AVG("rating")::numeric, 2), 0.00) AS avg_rating
  FROM "reviews"
  GROUP BY "sports_pitch_id"
) sub
WHERE sp."id" = sub."sports_pitch_id";

UPDATE "locations" loc
SET
  "rating_count" = sub.cnt,
  "rating_avg" = sub.avg_rating
FROM (
  SELECT sp."location_id", COUNT(r."id")::int AS cnt, COALESCE(ROUND(AVG(r."rating")::numeric, 2), 0.00) AS avg_rating
  FROM "sports_pitches" sp
  JOIN "reviews" r ON r."sports_pitch_id" = sp."id"
  GROUP BY sp."location_id"
) sub
WHERE loc."id" = sub."location_id";

-- 4. Nâng cấp bảng bookings (Hỗ trợ khách vãng lai Walk-in/Phone, Giữ chỗ có thời hạn hold_expires_at, Ca xuyên đêm start_at/end_at)
ALTER TABLE "bookings"
  ALTER COLUMN "user_id" DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS "booking_group_id" BIGINT,
  ADD COLUMN IF NOT EXISTS "guest_name" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "guest_phone" VARCHAR(20),
  ADD COLUMN IF NOT EXISTS "booking_source" "BookingSource" NOT NULL DEFAULT 'ONLINE',
  ADD COLUMN IF NOT EXISTS "start_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "end_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "hold_expires_at" TIMESTAMPTZ;

-- Backfill start_at và end_at cho các booking hiện có theo múi giờ Việt Nam (+07:00)
UPDATE "bookings"
SET
  "start_at" = (("booking_date" + "start_time") AT TIME ZONE 'Asia/Ho_Chi_Minh'),
  "end_at" = CASE
    WHEN "end_time" > "start_time" THEN (("booking_date" + "end_time") AT TIME ZONE 'Asia/Ho_Chi_Minh')
    ELSE ((("booking_date" + INTERVAL '1 day') + "end_time") AT TIME ZONE 'Asia/Ho_Chi_Minh')
  END
WHERE "start_at" IS NULL OR "end_at" IS NULL;

CREATE INDEX IF NOT EXISTS "bookings_booking_group_id_idx" ON "bookings"("booking_group_id");
CREATE INDEX IF NOT EXISTS "bookings_status_hold_expires_at_idx" ON "bookings"("status", "hold_expires_at");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_booking_group_id_fkey') THEN
    ALTER TABLE "bookings"
      ADD CONSTRAINT "bookings_booking_group_id_fkey"
      FOREIGN KEY ("booking_group_id") REFERENCES "booking_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Cho phép ca đấu kết thúc vào 00:00 (nửa đêm) trong bảng bookings
ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "bookings_time_check";
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_time_check"
  CHECK ("end_time" > "start_time" OR "end_time" = TIME '00:00');

-- Ràng buộc định danh khách đặt sân: phải có user_id (Online) hoặc có tên + SĐT khách vãng lai (Walk-in/Phone)
ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "bookings_customer_identity_check";
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customer_identity_check"
  CHECK ("user_id" IS NOT NULL OR ("guest_name" IS NOT NULL AND "guest_phone" IS NOT NULL)) NOT VALID;
ALTER TABLE "bookings" VALIDATE CONSTRAINT "bookings_customer_identity_check";

-- Nâng cấp ràng buộc EXCLUDE chống trùng lịch: hỗ trợ cả ca kết thúc lúc 00:00
ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "bookings_no_overlap";
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_no_overlap"
  EXCLUDE USING gist (
    "sports_pitch_id" WITH =,
    tsrange(
      "booking_date" + "start_time",
      CASE WHEN "end_time" > "start_time" THEN "booking_date" + "end_time" ELSE ("booking_date" + 1) + "end_time" END,
      '[)'
    ) WITH &&
  )
  WHERE ("status" IN ('PENDING', 'CONFIRMED'));

-- 5. Nâng cấp bảng promotions & promotion_redemptions (Mở khóa giới hạn số lượt dùng mỗi khách per_user_limit)
ALTER TABLE "promotions"
  ADD COLUMN IF NOT EXISTS "per_user_limit" INTEGER NOT NULL DEFAULT 1;

DROP INDEX IF EXISTS "promotion_redemptions_promotion_id_user_id_key";
CREATE INDEX IF NOT EXISTS "idx_promo_redemptions_user_status"
  ON "promotion_redemptions"("promotion_id", "user_id", "status");

-- 6. Nâng cấp bảng match_posts (Cho phép đăng kèo tìm đối theo bộ môn khi chưa chốt sân cụ thể)
ALTER TABLE "match_posts"
  ALTER COLUMN "sports_pitch_id" DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS "category_slug" VARCHAR(30);

-- Backfill category_slug từ sports_pitches cho các bài đăng hiện có
UPDATE "match_posts" mp
SET "category_slug" = sp."category"
FROM "sports_pitches" sp
WHERE mp."sports_pitch_id" = sp."id" AND mp."category_slug" IS NULL;

CREATE INDEX IF NOT EXISTS "match_posts_category_slug_idx" ON "match_posts"("category_slug");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'match_posts_category_slug_fkey') THEN
    ALTER TABLE "match_posts"
      ADD CONSTRAINT "match_posts_category_slug_fkey"
      FOREIGN KEY ("category_slug") REFERENCES "categories"("slug") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- 7. Nâng cấp bảng partner_ledger_entries (Liên kết Hóa đơn kỳ bill_id & Số dư lũy kế balance_after)
ALTER TABLE "partner_ledger_entries"
  ADD COLUMN IF NOT EXISTS "bill_id" BIGINT,
  ADD COLUMN IF NOT EXISTS "balance_after" DECIMAL(15,2) NOT NULL DEFAULT 0.00;

CREATE INDEX IF NOT EXISTS "partner_ledger_entries_bill_id_idx" ON "partner_ledger_entries"("bill_id");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'partner_ledger_entries_bill_id_fkey') THEN
    ALTER TABLE "partner_ledger_entries"
      ADD CONSTRAINT "partner_ledger_entries_bill_id_fkey"
      FOREIGN KEY ("bill_id") REFERENCES "partner_commission_bills"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Tính toán lại balance_after lũy kế cho các bút toán sổ cái hiện có
WITH running AS (
  SELECT
    "id",
    SUM("amount") OVER (PARTITION BY "partner_id" ORDER BY "created_at" ASC, "id" ASC) AS calc_balance
  FROM "partner_ledger_entries"
)
UPDATE "partner_ledger_entries" ple
SET "balance_after" = running.calc_balance
FROM running
WHERE ple."id" = running."id";
