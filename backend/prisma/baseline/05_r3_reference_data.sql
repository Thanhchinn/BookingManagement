-- ============================================================================
-- R3 - Chuẩn hóa dữ liệu tham chiếu:
--   * ~12 cột trạng thái/phân loại dạng chuỗi -> ENUM (giữ nguyên dữ liệu)
--   * products: trỏ product_categories bằng khóa ngoại
--   * locations, users: mã tỉnh/xã theo địa giới 2 cấp (có khóa ngoại)
--   * user_sport_preferences thay cho 2 cột JSON favorite_sports / skill_levels
-- Chạy trong 1 transaction: lỗi ở bất kỳ bước nào thì không có gì thay đổi.
-- ============================================================================
BEGIN;

CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE "AdminRole" AS ENUM ('SUPERADMIN', 'ADMIN', 'MODERATOR');
CREATE TYPE "PartnerStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');
CREATE TYPE "CommissionType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');
CREATE TYPE "SkillLevel" AS ENUM ('ANY', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED');
CREATE TYPE "MatchPostStatus" AS ENUM ('PENDING', 'OPEN', 'FULL', 'REJECTED', 'CANCELLED');
CREATE TYPE "MatchParticipantStatus" AS ENUM ('PENDING', 'JOINED', 'REJECTED');
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'SYSTEM');
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED');
CREATE TYPE "CommissionBillStatus" AS ENUM ('UNPAID', 'PROCESSING', 'PAID', 'OVERDUE');
CREATE TYPE "NotificationType" AS ENUM ('BOOKING', 'MATCH', 'PAYMENT', 'PROMOTION', 'SYSTEM');

-- 1. Chuỗi -> ENUM ------------------------------------------------------------------
-- Chuẩn hóa (in hoa, bỏ khoảng trắng), giá trị không hợp lệ -> `fallback`, rồi đổi kiểu giữ nguyên dữ liệu.
CREATE OR REPLACE FUNCTION pg_temp.convert_enum(tbl text, col text, typ text, fallback text, def text)
RETURNS void AS $$
BEGIN
  EXECUTE format('UPDATE %I SET %I = UPPER(TRIM(%I)) WHERE %I IS NOT NULL', tbl, col, col, col);
  EXECUTE format(
    'UPDATE %I SET %I = %L WHERE %I IS NOT NULL AND %I NOT IN (SELECT unnest(enum_range(NULL::%I))::text)',
    tbl, col, fallback, col, col, typ);
  EXECUTE format('ALTER TABLE %I ALTER COLUMN %I DROP DEFAULT', tbl, col);
  EXECUTE format('ALTER TABLE %I ALTER COLUMN %I TYPE %I USING (%I::%I)', tbl, col, typ, col, typ);
  IF def IS NOT NULL THEN
    EXECUTE format('ALTER TABLE %I ALTER COLUMN %I SET DEFAULT %L', tbl, col, def);
  END IF;
END $$ LANGUAGE plpgsql;

-- Ánh xạ các giá trị cũ đã biết trước khi chuyển
UPDATE "users" SET "gender" = CASE LOWER(TRIM("gender"))
  WHEN 'nam' THEN 'MALE' WHEN 'male' THEN 'MALE'
  WHEN 'nữ' THEN 'FEMALE' WHEN 'nu' THEN 'FEMALE' WHEN 'female' THEN 'FEMALE'
  WHEN 'khác' THEN 'OTHER' WHEN 'khac' THEN 'OTHER' WHEN 'other' THEN 'OTHER'
  ELSE NULL END;
UPDATE "partner_profiles" SET "commission_type" = 'FIXED_AMOUNT' WHERE UPPER(TRIM("commission_type")) IN ('FIXED', 'FIXED_AMOUNT');
UPDATE "bookings" SET "commission_type" = 'FIXED_AMOUNT' WHERE UPPER(TRIM("commission_type")) IN ('FIXED', 'FIXED_AMOUNT');
UPDATE "match_posts" SET "skill_level" = 'ANY' WHERE UPPER(TRIM("skill_level")) IN ('ALL', '');
UPDATE "match_posts" SET "status" = 'CANCELLED' WHERE UPPER(TRIM("status")) = 'CLOSED';
UPDATE "match_participants" SET "status" = 'JOINED' WHERE UPPER(TRIM("status")) = 'APPROVED';

SELECT pg_temp.convert_enum('users', 'gender', 'Gender', NULL, NULL);
SELECT pg_temp.convert_enum('admins', 'role', 'AdminRole', 'MODERATOR', 'MODERATOR');
SELECT pg_temp.convert_enum('partner_profiles', 'commission_type', 'CommissionType', 'PERCENTAGE', 'PERCENTAGE');
SELECT pg_temp.convert_enum('partner_profiles', 'status', 'PartnerStatus', 'PENDING', 'PENDING');
SELECT pg_temp.convert_enum('bookings', 'commission_type', 'CommissionType', 'PERCENTAGE', 'PERCENTAGE');
SELECT pg_temp.convert_enum('match_posts', 'skill_level', 'SkillLevel', 'ANY', 'ANY');
SELECT pg_temp.convert_enum('match_posts', 'status', 'MatchPostStatus', 'OPEN', 'OPEN');
SELECT pg_temp.convert_enum('match_participants', 'status', 'MatchParticipantStatus', 'PENDING', 'PENDING');
SELECT pg_temp.convert_enum('messages', 'type', 'MessageType', 'TEXT', 'TEXT');
SELECT pg_temp.convert_enum('disputes', 'status', 'DisputeStatus', 'OPEN', 'OPEN');
SELECT pg_temp.convert_enum('partner_commission_bills', 'status', 'CommissionBillStatus', 'UNPAID', 'UNPAID');
SELECT pg_temp.convert_enum('notifications', 'type', 'NotificationType', 'SYSTEM', NULL);

-- 2. products -> product_categories -----------------------------------------------------
-- Tên danh mục trùng trong cùng đối tác: đổi tên bản sao để áp dụng ràng buộc unique
UPDATE "product_categories" AS a SET "name" = LEFT(a."name", 80) || ' #' || a."id"
WHERE EXISTS (
  SELECT 1 FROM "product_categories" AS b
  WHERE b."partner_id" = a."partner_id" AND b."name" = a."name" AND b."id" < a."id"
);
DROP INDEX "product_categories_partner_id_idx";
CREATE UNIQUE INDEX "product_categories_partner_id_name_key" ON "product_categories"("partner_id", "name");

ALTER TABLE "products" ADD COLUMN "product_category_id" BIGINT;
UPDATE "products" AS p SET "product_category_id" = pc."id"
FROM "locations" AS l, "product_categories" AS pc
WHERE l."id" = p."location_id" AND pc."partner_id" = l."partner_id" AND LOWER(pc."name") = LOWER(p."category");
CREATE INDEX "products_product_category_id_idx" ON "products"("product_category_id");
ALTER TABLE "products" ADD CONSTRAINT "products_product_category_id_fkey"
  FOREIGN KEY ("product_category_id") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 3. Địa chỉ: mã tỉnh/xã --------------------------------------------------------------
ALTER TABLE "users" ADD COLUMN "province_code" VARCHAR(2), ADD COLUMN "ward_code" VARCHAR(6);
ALTER TABLE "locations" ADD COLUMN "province_code" VARCHAR(2), ADD COLUMN "ward_code" VARCHAR(6);

-- Khớp theo tên (bỏ tiền tố "Thành phố"/"TP."/"Tỉnh"); không khớp được thì để NULL
CREATE OR REPLACE FUNCTION pg_temp.norm_place(v text) RETURNS text AS $$
  SELECT NULLIF(TRIM(REGEXP_REPLACE(LOWER(COALESCE(v, '')),
    '^(thành phố|thanh pho|tp\.?|tỉnh|tinh|phường|phuong|xã|xa|thị trấn|thi tran|đặc khu|dac khu)\s*', '')), '')
$$ LANGUAGE sql IMMUTABLE;

UPDATE "locations" AS l SET "province_code" = p."province_code" FROM "location_provinces" AS p
WHERE pg_temp.norm_place(l."city") IN (pg_temp.norm_place(p."name"), pg_temp.norm_place(p."short_name"))
   OR (pg_temp.norm_place(l."city") IN ('hcm', 'hcmc', 'tphcm', 'sài gòn', 'sai gon') AND p."short_name" ILIKE '%Hồ Chí Minh%');
UPDATE "users" AS u SET "province_code" = p."province_code" FROM "location_provinces" AS p
WHERE pg_temp.norm_place(u."city") IN (pg_temp.norm_place(p."name"), pg_temp.norm_place(p."short_name"))
   OR (pg_temp.norm_place(u."city") IN ('hcm', 'hcmc', 'tphcm', 'sài gòn', 'sai gon') AND p."short_name" ILIKE '%Hồ Chí Minh%');
UPDATE "locations" AS l SET "ward_code" = w."ward_code" FROM "location_wards" AS w
WHERE w."province_code" = l."province_code" AND pg_temp.norm_place(w."name") = pg_temp.norm_place(l."ward");
UPDATE "users" AS u SET "ward_code" = w."ward_code" FROM "location_wards" AS w
WHERE w."province_code" = u."province_code" AND pg_temp.norm_place(w."name") = pg_temp.norm_place(u."ward");

CREATE INDEX "locations_province_code_ward_code_idx" ON "locations"("province_code", "ward_code");
ALTER TABLE "users" ADD CONSTRAINT "users_province_code_fkey"
  FOREIGN KEY ("province_code") REFERENCES "location_provinces"("province_code") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "users" ADD CONSTRAINT "users_ward_code_fkey"
  FOREIGN KEY ("ward_code") REFERENCES "location_wards"("ward_code") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "locations" ADD CONSTRAINT "locations_province_code_fkey"
  FOREIGN KEY ("province_code") REFERENCES "location_provinces"("province_code") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "locations" ADD CONSTRAINT "locations_ward_code_fkey"
  FOREIGN KEY ("ward_code") REFERENCES "location_wards"("ward_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- 4. Sở thích thể thao: JSON -> bảng --------------------------------------------------
CREATE TABLE "user_sport_preferences" (
    "user_id" BIGINT NOT NULL,
    "category_id" BIGINT NOT NULL,
    "skill_level" "SkillLevel",
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_sport_preferences_pkey" PRIMARY KEY ("user_id","category_id")
);
CREATE INDEX "user_sport_preferences_category_id_skill_level_idx" ON "user_sport_preferences"("category_id", "skill_level");
ALTER TABLE "user_sport_preferences" ADD CONSTRAINT "user_sport_preferences_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_sport_preferences" ADD CONSTRAINT "user_sport_preferences_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- favorite_sports: mảng tên hoặc slug bộ môn
INSERT INTO "user_sport_preferences" ("user_id", "category_id")
SELECT DISTINCT u."id", c."id"
FROM "users" AS u
CROSS JOIN LATERAL jsonb_array_elements_text(
  CASE WHEN jsonb_typeof(u."favorite_sports") = 'array' THEN u."favorite_sports" ELSE '[]'::jsonb END) AS f(v)
JOIN "categories" AS c ON LOWER(c."name") = LOWER(TRIM(f.v)) OR LOWER(c."slug") = LOWER(TRIM(f.v))
ON CONFLICT DO NOTHING;

-- skill_levels: { "<tên hoặc slug>": "BEGINNER" | ... }
INSERT INTO "user_sport_preferences" ("user_id", "category_id", "skill_level")
SELECT DISTINCT ON (u."id", c."id") u."id", c."id",
  CASE WHEN UPPER(TRIM(kv.value)) IN ('ANY', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED')
       THEN UPPER(TRIM(kv.value))::"SkillLevel" END
FROM "users" AS u
CROSS JOIN LATERAL jsonb_each_text(
  CASE WHEN jsonb_typeof(u."skill_levels") = 'object' THEN u."skill_levels" ELSE '{}'::jsonb END) AS kv
JOIN "categories" AS c ON LOWER(c."name") = LOWER(TRIM(kv.key)) OR LOWER(c."slug") = LOWER(TRIM(kv.key))
ON CONFLICT ("user_id", "category_id") DO UPDATE SET "skill_level" = EXCLUDED."skill_level";

ALTER TABLE "users" DROP COLUMN "favorite_sports", DROP COLUMN "skill_levels";

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

SELECT pg_temp.add_check('locations', 'locations_ward_needs_province_check', 'ward_code IS NULL OR province_code IS NOT NULL');
SELECT pg_temp.add_check('users', 'users_ward_needs_province_check', 'ward_code IS NULL OR province_code IS NOT NULL');
-- <<< CHECKS

COMMIT;
