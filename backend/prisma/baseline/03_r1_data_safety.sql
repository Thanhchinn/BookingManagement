-- ============================================================================
-- R1 - An toàn dữ liệu:
--   * Dữ liệu tài chính/lịch sử: ON DELETE CASCADE -> RESTRICT (ứng dụng chuyển sang xóa mềm)
--   * Cột xóa mềm (deleted_at), ẩn đơn (archived_at), ảnh chụp tên sản phẩm trong hóa đơn
--   * Bổ sung created_at / updated_at còn thiếu
--   * Index cho khóa ngoại, bỏ index vô dụng
--   * Ràng buộc CHECK
-- Chạy trong 1 transaction: lỗi ở bất kỳ bước nào thì không có gì thay đổi.
-- ============================================================================
BEGIN;

-- DropForeignKey
ALTER TABLE "otp_verifications" DROP CONSTRAINT "otp_verifications_user_id_fkey";

-- DropForeignKey
ALTER TABLE "partner_profiles" DROP CONSTRAINT "partner_profiles_user_id_fkey";

-- DropForeignKey
ALTER TABLE "locations" DROP CONSTRAINT "locations_partner_id_fkey";

-- DropForeignKey
ALTER TABLE "sports_pitches" DROP CONSTRAINT "sports_pitches_location_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_location_id_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_user_id_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_sports_pitch_id_fkey";

-- DropForeignKey
ALTER TABLE "booking_details" DROP CONSTRAINT "booking_details_product_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_booking_id_fkey";

-- DropForeignKey
ALTER TABLE "promotions" DROP CONSTRAINT "promotions_partner_id_fkey";

-- DropForeignKey
ALTER TABLE "match_posts" DROP CONSTRAINT "match_posts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "match_posts" DROP CONSTRAINT "match_posts_sports_pitch_id_fkey";

-- DropForeignKey
ALTER TABLE "disputes" DROP CONSTRAINT "disputes_booking_id_fkey";

-- DropForeignKey
ALTER TABLE "disputes" DROP CONSTRAINT "disputes_raised_by_fkey";

-- DropForeignKey
ALTER TABLE "disputes" DROP CONSTRAINT "disputes_against_partner_fkey";

-- DropForeignKey
ALTER TABLE "partner_commission_bills" DROP CONSTRAINT "partner_commission_bills_partner_id_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_booking_id_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_user_id_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_sports_pitch_id_fkey";

-- DropIndex
DROP INDEX "bookings_start_time_idx";

-- DropIndex
DROP INDEX "notifications_user_id_idx";

-- DropIndex
DROP INDEX "notifications_is_read_idx";

-- DropIndex
DROP INDEX "reviews_rating_idx";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "remember_token",
ADD COLUMN     "deleted_at" TIMESTAMP;

-- AlterTable
ALTER TABLE "otp_verifications" DROP COLUMN "user_id";

-- AlterTable
ALTER TABLE "locations" ADD COLUMN     "deleted_at" TIMESTAMP;

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "sports_pitches" ADD COLUMN     "deleted_at" TIMESTAMP;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "deleted_at" TIMESTAMP;

-- AlterTable
ALTER TABLE "slot_overrides" ADD COLUMN     "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "archived_at" TIMESTAMP;

-- AlterTable
ALTER TABLE "booking_details" ADD COLUMN     "product_name" VARCHAR(255);
UPDATE "booking_details" AS bd SET "product_name" = p."name" FROM "products" AS p WHERE p."id" = bd."product_id";
UPDATE "booking_details" SET "product_name" = '(Sản phẩm không xác định)' WHERE "product_name" IS NULL;
ALTER TABLE "booking_details" ALTER COLUMN "product_name" SET NOT NULL;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "promotions" ADD COLUMN     "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "match_posts" ADD COLUMN     "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "match_participants" ADD COLUMN     "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "chat_rooms" ADD COLUMN     "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "disputes" ADD COLUMN     "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "location_wards_province_code_idx" ON "location_wards"("province_code");

-- CreateIndex
CREATE INDEX "locations_partner_id_idx" ON "locations"("partner_id");

-- CreateIndex
CREATE INDEX "sports_pitches_location_id_idx" ON "sports_pitches"("location_id");

-- CreateIndex
CREATE INDEX "products_location_id_idx" ON "products"("location_id");

-- CreateIndex
CREATE INDEX "product_categories_partner_id_idx" ON "product_categories"("partner_id");

-- CreateIndex
CREATE INDEX "bookings_user_id_created_at_idx" ON "bookings"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "booking_details_booking_id_idx" ON "booking_details"("booking_id");

-- CreateIndex
CREATE INDEX "booking_details_product_id_idx" ON "booking_details"("product_id");

-- CreateIndex
CREATE INDEX "payments_booking_id_idx" ON "payments"("booking_id");

-- CreateIndex
CREATE INDEX "promotions_partner_id_idx" ON "promotions"("partner_id");

-- CreateIndex
CREATE INDEX "user_promotions_promotion_id_idx" ON "user_promotions"("promotion_id");

-- CreateIndex
CREATE INDEX "match_posts_user_id_idx" ON "match_posts"("user_id");

-- CreateIndex
CREATE INDEX "match_posts_sports_pitch_id_idx" ON "match_posts"("sports_pitch_id");

-- CreateIndex
CREATE INDEX "match_participants_user_id_idx" ON "match_participants"("user_id");

-- CreateIndex
CREATE INDEX "chat_room_members_user_id_idx" ON "chat_room_members"("user_id");

-- CreateIndex
CREATE INDEX "messages_sender_id_idx" ON "messages"("sender_id");

-- CreateIndex
CREATE INDEX "disputes_booking_id_idx" ON "disputes"("booking_id");

-- CreateIndex
CREATE INDEX "disputes_raised_by_idx" ON "disputes"("raised_by");

-- CreateIndex
CREATE INDEX "disputes_against_partner_status_idx" ON "disputes"("against_partner", "status");

-- CreateIndex
CREATE INDEX "partner_commission_bills_partner_id_period_start_idx" ON "partner_commission_bills"("partner_id", "period_start");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_created_at_idx" ON "notifications"("user_id", "is_read", "created_at");

-- CreateIndex
CREATE INDEX "reviews_sports_pitch_id_created_at_idx" ON "reviews"("sports_pitch_id", "created_at");

-- CreateIndex
CREATE INDEX "reviews_user_id_idx" ON "reviews"("user_id");

-- CreateIndex
CREATE INDEX "admin_partner_messages_partner_id_created_at_idx" ON "admin_partner_messages"("partner_id", "created_at");

-- AddForeignKey
ALTER TABLE "partner_profiles" ADD CONSTRAINT "partner_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partner_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sports_pitches" ADD CONSTRAINT "sports_pitches_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_sports_pitch_id_fkey" FOREIGN KEY ("sports_pitch_id") REFERENCES "sports_pitches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_details" ADD CONSTRAINT "booking_details_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partner_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_posts" ADD CONSTRAINT "match_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_posts" ADD CONSTRAINT "match_posts_sports_pitch_id_fkey" FOREIGN KEY ("sports_pitch_id") REFERENCES "sports_pitches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_raised_by_fkey" FOREIGN KEY ("raised_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_against_partner_fkey" FOREIGN KEY ("against_partner") REFERENCES "partner_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_commission_bills" ADD CONSTRAINT "partner_commission_bills_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partner_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_sports_pitch_id_fkey" FOREIGN KEY ("sports_pitch_id") REFERENCES "sports_pitches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- updated_at do Prisma (@updatedAt) tự gán, bỏ DEFAULT tạm dùng để điền dữ liệu cũ
ALTER TABLE "categories" ALTER COLUMN "updated_at" DROP DEFAULT;
ALTER TABLE "slot_overrides" ALTER COLUMN "updated_at" DROP DEFAULT;
ALTER TABLE "payments" ALTER COLUMN "updated_at" DROP DEFAULT;
ALTER TABLE "promotions" ALTER COLUMN "updated_at" DROP DEFAULT;
ALTER TABLE "match_posts" ALTER COLUMN "updated_at" DROP DEFAULT;
ALTER TABLE "match_participants" ALTER COLUMN "updated_at" DROP DEFAULT;
ALTER TABLE "disputes" ALTER COLUMN "updated_at" DROP DEFAULT;
ALTER TABLE "reviews" ALTER COLUMN "updated_at" DROP DEFAULT;

-- >>> CHECKS (gom vào 0_init)
-- ============================================================================
-- Ràng buộc CHECK: chặn dữ liệu vô lý ngay tại DB (Prisma không quản lý CHECK, nên không bị migrate xóa).
-- Thêm với NOT VALID rồi thử VALIDATE: nếu dữ liệu cũ vi phạm thì chỉ cảnh báo (WARNING),
-- ràng buộc vẫn áp dụng cho mọi dữ liệu ghi mới.
-- ============================================================================
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

SELECT pg_temp.add_check('users', 'users_loyalty_points_check', 'loyalty_points >= 0');
SELECT pg_temp.add_check('partner_profiles', 'partner_profiles_commission_check',
  'commission_rate BETWEEN 0 AND 100 AND commission_fixed_amount >= 0');
SELECT pg_temp.add_check('sports_pitches', 'sports_pitches_price_check', 'base_price_per_hour >= 0');
SELECT pg_temp.add_check('products', 'products_price_check', 'price >= 0');
SELECT pg_temp.add_check('time_slots', 'time_slots_day_check', 'day_of_week BETWEEN 0 AND 6');
SELECT pg_temp.add_check('time_slots', 'time_slots_time_check', 'end_time > start_time OR end_time = TIME ''00:00''');
SELECT pg_temp.add_check('time_slots', 'time_slots_price_modifier_check', 'price_modifier > 0');
SELECT pg_temp.add_check('slot_overrides', 'slot_overrides_time_check',
  'start_time IS NULL OR end_time IS NULL OR end_time > start_time');
SELECT pg_temp.add_check('slot_overrides', 'slot_overrides_price_modifier_check', 'price_modifier > 0');
SELECT pg_temp.add_check('bookings', 'bookings_time_check', 'end_time > start_time');
SELECT pg_temp.add_check('bookings', 'bookings_amounts_check',
  'base_price >= 0 AND discount_amount >= 0 AND final_price >= 0 AND commission_amount >= 0');
SELECT pg_temp.add_check('booking_details', 'booking_details_quantity_check', 'quantity > 0');
SELECT pg_temp.add_check('booking_details', 'booking_details_price_check', 'price >= 0');
SELECT pg_temp.add_check('payments', 'payments_amount_check', 'amount >= 0');
SELECT pg_temp.add_check('promotions', 'promotions_values_check',
  'discount_percent BETWEEN 0 AND 100 AND min_order_value >= 0 AND (max_discount_amount IS NULL OR max_discount_amount >= 0)');
SELECT pg_temp.add_check('promotions', 'promotions_dates_check', 'end_date > start_date');
SELECT pg_temp.add_check('promotions', 'promotions_usage_check', 'usage_limit >= 0 AND used_count >= 0');
SELECT pg_temp.add_check('match_posts', 'match_posts_players_check',
  'max_players >= 2 AND current_players BETWEEN 0 AND max_players');
SELECT pg_temp.add_check('match_posts', 'match_posts_time_check', 'end_time > start_time');
SELECT pg_temp.add_check('reviews', 'reviews_rating_check', 'rating BETWEEN 1 AND 5');
-- <<< CHECKS

COMMIT;
