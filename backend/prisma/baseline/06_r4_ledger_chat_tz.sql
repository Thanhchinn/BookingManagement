-- ============================================================================
-- R4 - Kiến trúc:
--   * TIMESTAMP -> TIMESTAMPTZ cho mọi cột thời điểm (giữ đúng giá trị: Prisma luôn ghi UTC)
--   * Gộp chat: admin_partner_messages -> phòng chat loại SUPPORT trong chat_rooms/messages
--   * Sổ cái hoa hồng đối tác (partner_ledger_entries), balance = tổng bút toán
-- Chạy trong 1 transaction: lỗi ở bất kỳ bước nào thì không có gì thay đổi.
-- ============================================================================
BEGIN;

CREATE TYPE "LedgerEntryType" AS ENUM ('COMMISSION_CHARGE', 'COMMISSION_REVERSAL', 'COMMISSION_PAYMENT', 'ADJUSTMENT');
CREATE TYPE "ChatRoomType" AS ENUM ('INDIVIDUAL', 'MATCH', 'SUPPORT');

-- 1. TIMESTAMPTZ ---------------------------------------------------------------------
-- Giá trị cũ là giờ UTC (Prisma ghi UTC) => phải ép "AT TIME ZONE 'UTC'".
-- KHÔNG dùng ép kiểu mặc định: PostgreSQL sẽ hiểu theo múi giờ của phiên (VD Asia/Ho_Chi_Minh) và lệch 7 tiếng.
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT table_name, column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND data_type = 'timestamp without time zone' AND table_name <> '_prisma_migrations'
  LOOP
    EXECUTE format('ALTER TABLE %I ALTER COLUMN %I TYPE TIMESTAMPTZ USING (%I AT TIME ZONE ''UTC'')',
      r.table_name, r.column_name, r.column_name);
  END LOOP;
END $$;

-- 2. Gộp chat ------------------------------------------------------------------------
UPDATE "chat_rooms" SET "type" = UPPER(TRIM("type"));
UPDATE "chat_rooms" SET "type" = 'INDIVIDUAL' WHERE "type" NOT IN ('INDIVIDUAL', 'MATCH', 'SUPPORT');
ALTER TABLE "chat_rooms"
  ALTER COLUMN "type" DROP DEFAULT,
  ALTER COLUMN "type" TYPE "ChatRoomType" USING ("type"::"ChatRoomType"),
  ALTER COLUMN "type" SET DEFAULT 'INDIVIDUAL',
  ADD COLUMN "partner_id" BIGINT;
CREATE UNIQUE INDEX "chat_rooms_partner_id_key" ON "chat_rooms"("partner_id");
ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_partner_id_fkey"
  FOREIGN KEY ("partner_id") REFERENCES "partner_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "messages"
  ADD COLUMN "sender_admin_id" BIGINT,
  ALTER COLUMN "sender_id" DROP NOT NULL;
CREATE INDEX "messages_sender_admin_id_idx" ON "messages"("sender_admin_id");
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_admin_id_fkey"
  FOREIGN KEY ("sender_admin_id") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Mỗi đối tác có lịch sử chat với admin -> 1 phòng SUPPORT (thành viên: tài khoản user của đối tác)
INSERT INTO "chat_rooms" ("type", "partner_id", "name", "created_at")
SELECT 'SUPPORT', p."id", 'Hỗ trợ: ' || p."business_name", MIN(m."created_at")
FROM "partner_profiles" AS p
JOIN "admin_partner_messages" AS m ON m."partner_id" = p."id"
GROUP BY p."id", p."business_name";

INSERT INTO "chat_room_members" ("chat_room_id", "user_id")
SELECT r."id", p."user_id"
FROM "chat_rooms" AS r JOIN "partner_profiles" AS p ON p."id" = r."partner_id"
WHERE r."type" = 'SUPPORT'
ON CONFLICT DO NOTHING;

INSERT INTO "messages" ("chat_room_id", "sender_id", "sender_admin_id", "message_text", "type", "created_at")
SELECT r."id",
  CASE WHEN UPPER(m."sender_type") = 'PARTNER' THEN p."user_id" END,
  CASE WHEN UPPER(m."sender_type") = 'ADMIN' THEN (SELECT a."id" FROM "admins" AS a WHERE a."id" = m."sender_id") END,
  m."message_text", 'TEXT', m."created_at"
FROM "admin_partner_messages" AS m
JOIN "chat_rooms" AS r ON r."partner_id" = m."partner_id"
JOIN "partner_profiles" AS p ON p."id" = m."partner_id"
ORDER BY m."id";

DROP TABLE "admin_partner_messages";

-- 3. Sổ cái hoa hồng đối tác ------------------------------------------------------------
CREATE TABLE "partner_ledger_entries" (
    "id" BIGSERIAL NOT NULL,
    "partner_id" BIGINT NOT NULL,
    "booking_id" BIGINT,
    "type" "LedgerEntryType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "note" TEXT,
    "created_by" BIGINT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "partner_ledger_entries_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "partner_ledger_entries_partner_id_created_at_idx" ON "partner_ledger_entries"("partner_id", "created_at");
CREATE UNIQUE INDEX "partner_ledger_entries_booking_id_type_key" ON "partner_ledger_entries"("booking_id", "type");
ALTER TABLE "partner_ledger_entries" ADD CONSTRAINT "partner_ledger_entries_partner_id_fkey"
  FOREIGN KEY ("partner_id") REFERENCES "partner_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "partner_ledger_entries" ADD CONSTRAINT "partner_ledger_entries_booking_id_fkey"
  FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Ghi sổ cho các đơn đã hoàn thành trước đây
INSERT INTO "partner_ledger_entries" ("partner_id", "booking_id", "type", "amount", "note", "created_at")
SELECT l."partner_id", b."id", 'COMMISSION_CHARGE', b."commission_amount", 'Hoa hồng đơn ' || b."booking_code" || ' (dữ liệu cũ)', b."updated_at"
FROM "bookings" AS b
JOIN "sports_pitches" AS sp ON sp."id" = b."sports_pitch_id"
JOIN "locations" AS l ON l."id" = sp."location_id"
WHERE b."status" = 'COMPLETED' AND b."commission_amount" > 0;

INSERT INTO "partner_ledger_entries" ("partner_id", "booking_id", "type", "amount", "note", "created_at")
SELECT e."partner_id", e."booking_id", 'COMMISSION_REVERSAL', -e."amount", 'Hoàn hoa hồng do đơn đã hoàn tiền (dữ liệu cũ)', e."created_at"
FROM "partner_ledger_entries" AS e
JOIN "bookings" AS b ON b."id" = e."booking_id"
WHERE e."type" = 'COMMISSION_CHARGE' AND b."payment_status" = 'REFUNDED';

-- balance trước đây chưa được dùng: tính lại từ sổ cái
UPDATE "partner_profiles" AS p
SET "balance" = COALESCE((SELECT SUM(e."amount") FROM "partner_ledger_entries" AS e WHERE e."partner_id" = p."id"), 0);

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

SELECT pg_temp.add_check('messages', 'messages_single_sender_check',
  'NOT (sender_id IS NOT NULL AND sender_admin_id IS NOT NULL)');
SELECT pg_temp.add_check('chat_rooms', 'chat_rooms_support_partner_check',
  'type <> ''SUPPORT'' OR partner_id IS NOT NULL');
SELECT pg_temp.add_check('partner_ledger_entries', 'partner_ledger_entries_sign_check',
  '(type = ''COMMISSION_CHARGE'' AND amount >= 0) OR (type IN (''COMMISSION_REVERSAL'', ''COMMISSION_PAYMENT'') AND amount <= 0) OR type = ''ADJUSTMENT''');
-- <<< CHECKS

COMMIT;
