-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BookingPaymentStatus" AS ENUM ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentTransactionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'MOMO', 'VNPAY');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('CASH', 'DEPOSIT', 'FULL', 'REFUND');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENT', 'FIXED');

-- CreateEnum
CREATE TYPE "RedemptionStatus" AS ENUM ('APPLIED', 'RELEASED');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('USER', 'PARTNER', 'ADMIN', 'SYSTEM');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPERADMIN', 'ADMIN', 'MODERATOR');

-- CreateEnum
CREATE TYPE "PartnerStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "CommissionType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('ANY', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "MatchPostStatus" AS ENUM ('PENDING', 'OPEN', 'FULL', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MatchParticipantStatus" AS ENUM ('PENDING', 'JOINED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CommissionBillStatus" AS ENUM ('UNPAID', 'PROCESSING', 'PAID', 'OVERDUE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BOOKING', 'MATCH', 'PAYMENT', 'PROMOTION', 'SYSTEM');

-- CreateEnum
CREATE TYPE "LedgerEntryType" AS ENUM ('COMMISSION_CHARGE', 'COMMISSION_REVERSAL', 'COMMISSION_PAYMENT', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "ChatRoomType" AS ENUM ('INDIVIDUAL', 'MATCH', 'SUPPORT');

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "email_verified_at" TIMESTAMPTZ,
    "password" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "avatar_url" TEXT,
    "address" TEXT,
    "ward" VARCHAR(100),
    "district" VARCHAR(100),
    "city" VARCHAR(100),
    "province_code" VARCHAR(2),
    "ward_code" VARCHAR(6),
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "loyalty_points" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "birth_date" DATE,
    "gender" "Gender",
    "bio" TEXT,
    "preferred_play_time" JSONB,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_verifications" (
    "id" BIGSERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "otp_code" VARCHAR(64) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" BIGSERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(255),
    "role" "AdminRole" NOT NULL DEFAULT 'MODERATOR',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_profiles" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "business_name" VARCHAR(255) NOT NULL,
    "tax_code" VARCHAR(50),
    "business_license_url" TEXT,
    "commission_rate" DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    "commission_type" "CommissionType" NOT NULL DEFAULT 'PERCENTAGE',
    "commission_fixed_amount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "status" "PartnerStatus" NOT NULL DEFAULT 'PENDING',
    "approved_by" BIGINT,
    "bank_name" VARCHAR(100),
    "bank_account_number" VARCHAR(50),
    "bank_account_name" VARCHAR(100),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "partner_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_provinces" (
    "id" BIGSERIAL NOT NULL,
    "province_code" VARCHAR(2) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "short_name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(5) NOT NULL,
    "place_type" VARCHAR(255) NOT NULL,
    "country" VARCHAR(10) NOT NULL DEFAULT 'VN',
    "slug" VARCHAR(255),
    "image" VARCHAR(255),

    CONSTRAINT "location_provinces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_wards" (
    "id" BIGSERIAL NOT NULL,
    "ward_code" VARCHAR(6) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "province_code" VARCHAR(2) NOT NULL,

    CONSTRAINT "location_wards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" BIGSERIAL NOT NULL,
    "partner_id" BIGINT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" TEXT NOT NULL,
    "ward" VARCHAR(100),
    "district" VARCHAR(100),
    "city" VARCHAR(100),
    "province_code" VARCHAR(2),
    "ward_code" VARCHAR(6),
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "contact_phone" VARCHAR(20),
    "image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "icon" VARCHAR(255) NOT NULL DEFAULT 'fa-medal',
    "color_bg" VARCHAR(255) NOT NULL DEFAULT 'bg-emerald-100',
    "color_text" VARCHAR(255) NOT NULL DEFAULT 'text-emerald-600',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sports_pitches" (
    "id" BIGSERIAL NOT NULL,
    "location_id" BIGINT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(30) NOT NULL,
    "sub_type" VARCHAR(50),
    "description" TEXT,
    "base_price_per_hour" DECIMAL(12,2) NOT NULL,
    "image_urls" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "sports_pitches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "amenities" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "icon" VARCHAR(255),

    CONSTRAINT "amenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_amenities" (
    "location_id" BIGINT NOT NULL,
    "amenity_id" BIGINT NOT NULL,

    CONSTRAINT "location_amenities_pkey" PRIMARY KEY ("location_id","amenity_id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" BIGSERIAL NOT NULL,
    "location_id" BIGINT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(50) NOT NULL DEFAULT 'DRINK',
    "product_category_id" BIGINT,
    "description" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "image_url" TEXT,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "id" BIGSERIAL NOT NULL,
    "partner_id" BIGINT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "icon" VARCHAR(50) DEFAULT '📦',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_slots" (
    "id" BIGSERIAL NOT NULL,
    "sports_pitch_id" BIGINT NOT NULL,
    "day_of_week" SMALLINT NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "price_modifier" DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slot_overrides" (
    "id" BIGSERIAL NOT NULL,
    "sports_pitch_id" BIGINT NOT NULL,
    "override_date" DATE NOT NULL,
    "start_time" TIME,
    "end_time" TIME,
    "price_modifier" DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    "is_closed" BOOLEAN NOT NULL DEFAULT false,
    "reason" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "slot_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" BIGSERIAL NOT NULL,
    "booking_code" VARCHAR(20) NOT NULL,
    "user_id" BIGINT NOT NULL,
    "sports_pitch_id" BIGINT NOT NULL,
    "promo_id" BIGINT,
    "booking_date" DATE NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "base_price" DECIMAL(12,2) NOT NULL,
    "service_amount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "discount_amount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "vat_amount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "final_price" DECIMAL(12,2) NOT NULL,
    "paid_amount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "commission_type" "CommissionType" NOT NULL DEFAULT 'PERCENTAGE',
    "commission_rate" DECIMAL(5,2),
    "commission_fixed_amount" DECIMAL(12,2),
    "commission_amount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "payment_status" "BookingPaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "cancellation_reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "archived_at" TIMESTAMPTZ,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_details" (
    "id" BIGSERIAL NOT NULL,
    "booking_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "product_name" VARCHAR(255) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "booking_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" BIGSERIAL NOT NULL,
    "booking_id" BIGINT NOT NULL,
    "provider" VARCHAR(30),
    "transaction_id" VARCHAR(255),
    "amount" DECIMAL(12,2) NOT NULL,
    "payment_method" "PaymentMethod",
    "payment_type" "PaymentType" NOT NULL,
    "status" "PaymentTransactionStatus" NOT NULL DEFAULT 'PENDING',
    "raw_response" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotions" (
    "id" BIGSERIAL NOT NULL,
    "partner_id" BIGINT,
    "code" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "discount_type" "DiscountType" NOT NULL DEFAULT 'PERCENT',
    "discount_percent" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "fixed_discount_amount" DECIMAL(12,2),
    "max_discount_amount" DECIMAL(12,2),
    "min_order_value" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "start_date" TIMESTAMPTZ NOT NULL,
    "end_date" TIMESTAMPTZ NOT NULL,
    "usage_limit" INTEGER NOT NULL DEFAULT 0,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_redemptions" (
    "id" BIGSERIAL NOT NULL,
    "promotion_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "booking_id" BIGINT,
    "discount_amount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "status" "RedemptionStatus" NOT NULL DEFAULT 'APPLIED',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "promotion_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_posts" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "sports_pitch_id" BIGINT NOT NULL,
    "booking_id" BIGINT,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "play_date" DATE NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "skill_level" "SkillLevel" NOT NULL DEFAULT 'ANY',
    "max_players" INTEGER NOT NULL,
    "current_players" INTEGER NOT NULL DEFAULT 1,
    "status" "MatchPostStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "match_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_participants" (
    "id" BIGSERIAL NOT NULL,
    "match_post_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "status" "MatchParticipantStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "match_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_rooms" (
    "id" BIGSERIAL NOT NULL,
    "type" "ChatRoomType" NOT NULL DEFAULT 'INDIVIDUAL',
    "match_post_id" BIGINT,
    "partner_id" BIGINT,
    "name" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_room_members" (
    "id" BIGSERIAL NOT NULL,
    "chat_room_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "last_read_at" TIMESTAMPTZ,

    CONSTRAINT "chat_room_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" BIGSERIAL NOT NULL,
    "chat_room_id" BIGINT NOT NULL,
    "sender_id" BIGINT,
    "sender_admin_id" BIGINT,
    "message_text" TEXT NOT NULL,
    "type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "attachments" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disputes" (
    "id" BIGSERIAL NOT NULL,
    "booking_id" BIGINT NOT NULL,
    "raised_by" BIGINT NOT NULL,
    "against_partner" BIGINT NOT NULL,
    "category" VARCHAR(30) NOT NULL,
    "description" TEXT NOT NULL,
    "evidence_urls" JSONB,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "resolved_by" BIGINT,
    "resolved_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_commission_bills" (
    "id" BIGSERIAL NOT NULL,
    "partner_id" BIGINT NOT NULL,
    "bill_code" VARCHAR(50) NOT NULL,
    "total_bookings_count" INTEGER NOT NULL DEFAULT 0,
    "total_revenue" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "commission_amount" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "due_date" DATE NOT NULL,
    "status" "CommissionBillStatus" NOT NULL DEFAULT 'UNPAID',
    "payment_evidence_url" TEXT,
    "processed_by" BIGINT,
    "processed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "partner_commission_bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "related_id" BIGINT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" BIGSERIAL NOT NULL,
    "booking_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "sports_pitch_id" BIGINT NOT NULL,
    "rating" SMALLINT NOT NULL,
    "comment" TEXT,
    "images" JSONB,
    "partner_reply" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sport_preferences" (
    "user_id" BIGINT NOT NULL,
    "category_id" BIGINT NOT NULL,
    "skill_level" "SkillLevel",
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sport_preferences_pkey" PRIMARY KEY ("user_id","category_id")
);

-- CreateTable
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

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "idx_users_location" ON "users"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "otp_verifications_email_key" ON "otp_verifications"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "partner_profiles_user_id_key" ON "partner_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "location_provinces_province_code_key" ON "location_provinces"("province_code");

-- CreateIndex
CREATE UNIQUE INDEX "location_provinces_code_key" ON "location_provinces"("code");

-- CreateIndex
CREATE UNIQUE INDEX "location_wards_ward_code_key" ON "location_wards"("ward_code");

-- CreateIndex
CREATE INDEX "location_wards_province_code_idx" ON "location_wards"("province_code");

-- CreateIndex
CREATE INDEX "locations_partner_id_idx" ON "locations"("partner_id");

-- CreateIndex
CREATE INDEX "locations_province_code_ward_code_idx" ON "locations"("province_code", "ward_code");

-- CreateIndex
CREATE INDEX "idx_locations_city_district" ON "locations"("city", "district");

-- CreateIndex
CREATE INDEX "idx_locations_geo" ON "locations"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "sports_pitches_location_id_idx" ON "sports_pitches"("location_id");

-- CreateIndex
CREATE INDEX "idx_sports_pitches_category" ON "sports_pitches"("category");

-- CreateIndex
CREATE UNIQUE INDEX "amenities_name_key" ON "amenities"("name");

-- CreateIndex
CREATE INDEX "products_location_id_idx" ON "products"("location_id");

-- CreateIndex
CREATE INDEX "products_product_category_id_idx" ON "products"("product_category_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_partner_id_name_key" ON "product_categories"("partner_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "time_slots_sports_pitch_id_day_of_week_start_time_key" ON "time_slots"("sports_pitch_id", "day_of_week", "start_time");

-- CreateIndex
CREATE UNIQUE INDEX "slot_overrides_sports_pitch_id_override_date_start_time_key" ON "slot_overrides"("sports_pitch_id", "override_date", "start_time");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_booking_code_key" ON "bookings"("booking_code");

-- CreateIndex
CREATE INDEX "bookings_booking_date_idx" ON "bookings"("booking_date");

-- CreateIndex
CREATE INDEX "bookings_user_id_created_at_idx" ON "bookings"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "bookings_sports_pitch_id_booking_date_status_idx" ON "bookings"("sports_pitch_id", "booking_date", "status");

-- CreateIndex
CREATE INDEX "booking_details_booking_id_idx" ON "booking_details"("booking_id");

-- CreateIndex
CREATE INDEX "booking_details_product_id_idx" ON "booking_details"("product_id");

-- CreateIndex
CREATE INDEX "payments_booking_id_idx" ON "payments"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_provider_transaction_id_key" ON "payments"("provider", "transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "promotions_code_key" ON "promotions"("code");

-- CreateIndex
CREATE INDEX "promotions_partner_id_idx" ON "promotions"("partner_id");

-- CreateIndex
CREATE INDEX "idx_promotions_dates" ON "promotions"("start_date", "end_date");

-- CreateIndex
CREATE UNIQUE INDEX "promotion_redemptions_booking_id_key" ON "promotion_redemptions"("booking_id");

-- CreateIndex
CREATE INDEX "promotion_redemptions_user_id_idx" ON "promotion_redemptions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "promotion_redemptions_promotion_id_user_id_key" ON "promotion_redemptions"("promotion_id", "user_id");

-- CreateIndex
CREATE INDEX "booking_status_history_booking_id_created_at_idx" ON "booking_status_history"("booking_id", "created_at");

-- CreateIndex
CREATE INDEX "match_posts_user_id_idx" ON "match_posts"("user_id");

-- CreateIndex
CREATE INDEX "match_posts_sports_pitch_id_idx" ON "match_posts"("sports_pitch_id");

-- CreateIndex
CREATE INDEX "idx_match_posts_date_status" ON "match_posts"("play_date", "status");

-- CreateIndex
CREATE INDEX "match_participants_user_id_idx" ON "match_participants"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "match_participants_match_post_id_user_id_key" ON "match_participants"("match_post_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_rooms_match_post_id_key" ON "chat_rooms"("match_post_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_rooms_partner_id_key" ON "chat_rooms"("partner_id");

-- CreateIndex
CREATE INDEX "chat_room_members_user_id_idx" ON "chat_room_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_room_members_chat_room_id_user_id_key" ON "chat_room_members"("chat_room_id", "user_id");

-- CreateIndex
CREATE INDEX "idx_messages_room_time" ON "messages"("chat_room_id", "created_at");

-- CreateIndex
CREATE INDEX "messages_sender_id_idx" ON "messages"("sender_id");

-- CreateIndex
CREATE INDEX "messages_sender_admin_id_idx" ON "messages"("sender_admin_id");

-- CreateIndex
CREATE INDEX "disputes_booking_id_idx" ON "disputes"("booking_id");

-- CreateIndex
CREATE INDEX "disputes_raised_by_idx" ON "disputes"("raised_by");

-- CreateIndex
CREATE INDEX "disputes_against_partner_status_idx" ON "disputes"("against_partner", "status");

-- CreateIndex
CREATE UNIQUE INDEX "partner_commission_bills_bill_code_key" ON "partner_commission_bills"("bill_code");

-- CreateIndex
CREATE INDEX "partner_commission_bills_partner_id_period_start_idx" ON "partner_commission_bills"("partner_id", "period_start");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_created_at_idx" ON "notifications"("user_id", "is_read", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_booking_id_key" ON "reviews"("booking_id");

-- CreateIndex
CREATE INDEX "reviews_sports_pitch_id_created_at_idx" ON "reviews"("sports_pitch_id", "created_at");

-- CreateIndex
CREATE INDEX "reviews_user_id_idx" ON "reviews"("user_id");

-- CreateIndex
CREATE INDEX "user_sport_preferences_category_id_skill_level_idx" ON "user_sport_preferences"("category_id", "skill_level");

-- CreateIndex
CREATE INDEX "partner_ledger_entries_partner_id_created_at_idx" ON "partner_ledger_entries"("partner_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "partner_ledger_entries_booking_id_type_key" ON "partner_ledger_entries"("booking_id", "type");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_province_code_fkey" FOREIGN KEY ("province_code") REFERENCES "location_provinces"("province_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_ward_code_fkey" FOREIGN KEY ("ward_code") REFERENCES "location_wards"("ward_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_profiles" ADD CONSTRAINT "partner_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_profiles" ADD CONSTRAINT "partner_profiles_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_wards" ADD CONSTRAINT "location_wards_province_code_fkey" FOREIGN KEY ("province_code") REFERENCES "location_provinces"("province_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partner_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_province_code_fkey" FOREIGN KEY ("province_code") REFERENCES "location_provinces"("province_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_ward_code_fkey" FOREIGN KEY ("ward_code") REFERENCES "location_wards"("ward_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sports_pitches" ADD CONSTRAINT "sports_pitches_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sports_pitches" ADD CONSTRAINT "sports_pitches_category_fkey" FOREIGN KEY ("category") REFERENCES "categories"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_amenities" ADD CONSTRAINT "location_amenities_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_amenities" ADD CONSTRAINT "location_amenities_amenity_id_fkey" FOREIGN KEY ("amenity_id") REFERENCES "amenities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_product_category_id_fkey" FOREIGN KEY ("product_category_id") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partner_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_slots" ADD CONSTRAINT "time_slots_sports_pitch_id_fkey" FOREIGN KEY ("sports_pitch_id") REFERENCES "sports_pitches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slot_overrides" ADD CONSTRAINT "slot_overrides_sports_pitch_id_fkey" FOREIGN KEY ("sports_pitch_id") REFERENCES "sports_pitches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_sports_pitch_id_fkey" FOREIGN KEY ("sports_pitch_id") REFERENCES "sports_pitches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_promo_id_fkey" FOREIGN KEY ("promo_id") REFERENCES "promotions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_details" ADD CONSTRAINT "booking_details_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_details" ADD CONSTRAINT "booking_details_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partner_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_redemptions" ADD CONSTRAINT "promotion_redemptions_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "promotions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_redemptions" ADD CONSTRAINT "promotion_redemptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_redemptions" ADD CONSTRAINT "promotion_redemptions_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_status_history" ADD CONSTRAINT "booking_status_history_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_posts" ADD CONSTRAINT "match_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_posts" ADD CONSTRAINT "match_posts_sports_pitch_id_fkey" FOREIGN KEY ("sports_pitch_id") REFERENCES "sports_pitches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_posts" ADD CONSTRAINT "match_posts_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_participants" ADD CONSTRAINT "match_participants_match_post_id_fkey" FOREIGN KEY ("match_post_id") REFERENCES "match_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_participants" ADD CONSTRAINT "match_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_match_post_id_fkey" FOREIGN KEY ("match_post_id") REFERENCES "match_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partner_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_room_members" ADD CONSTRAINT "chat_room_members_chat_room_id_fkey" FOREIGN KEY ("chat_room_id") REFERENCES "chat_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_room_members" ADD CONSTRAINT "chat_room_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_room_id_fkey" FOREIGN KEY ("chat_room_id") REFERENCES "chat_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_admin_id_fkey" FOREIGN KEY ("sender_admin_id") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_raised_by_fkey" FOREIGN KEY ("raised_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_against_partner_fkey" FOREIGN KEY ("against_partner") REFERENCES "partner_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_commission_bills" ADD CONSTRAINT "partner_commission_bills_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partner_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_commission_bills" ADD CONSTRAINT "partner_commission_bills_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_sports_pitch_id_fkey" FOREIGN KEY ("sports_pitch_id") REFERENCES "sports_pitches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sport_preferences" ADD CONSTRAINT "user_sport_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sport_preferences" ADD CONSTRAINT "user_sport_preferences_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_ledger_entries" ADD CONSTRAINT "partner_ledger_entries_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partner_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_ledger_entries" ADD CONSTRAINT "partner_ledger_entries_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================================
-- Phần Prisma không biểu diễn được trong schema.prisma (thêm thủ công).
-- Prisma bỏ qua ràng buộc EXCLUDE/CHECK khi so sánh schema (đã kiểm tra: `migrate dev` không sinh lệnh DROP).
-- Nếu sau này một migration mới có lệnh DROP "bookings_no_overlap" hoặc DROP CHECK, hãy xóa lệnh đó trước khi áp dụng.
-- ============================================================================

-- Chống đặt trùng giờ: 2 đơn PENDING/CONFIRMED trên cùng một sân không được giao nhau về thời gian
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_no_overlap"
  EXCLUDE USING gist (
    "sports_pitch_id" WITH =,
    tsrange("booking_date" + "start_time", "booking_date" + "end_time", '[)') WITH &&
  )
  WHERE ("status" IN ('PENDING', 'CONFIRMED'));

-- CHECK từ 03_r1_data_safety.sql
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

-- CHECK từ 04_r2_money_and_history.sql
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

-- CHECK từ 05_r3_reference_data.sql
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

-- CHECK từ 06_r4_ledger_chat_tz.sql
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
