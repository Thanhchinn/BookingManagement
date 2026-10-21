/*
  Warnings:

  - You are about to drop the `partner_payouts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "partner_payouts" DROP CONSTRAINT "partner_payouts_partner_id_fkey";

-- DropForeignKey
ALTER TABLE "partner_payouts" DROP CONSTRAINT "partner_payouts_processed_by_fkey";

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "commission_amount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
ADD COLUMN     "commission_fixed_amount" DECIMAL(12,2),
ADD COLUMN     "commission_rate" DECIMAL(5,2),
ADD COLUMN     "commission_type" VARCHAR(20) NOT NULL DEFAULT 'PERCENTAGE';

-- AlterTable
ALTER TABLE "partner_profiles" ADD COLUMN     "commission_fixed_amount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
ADD COLUMN     "commission_type" VARCHAR(20) NOT NULL DEFAULT 'PERCENTAGE';

-- DropTable
DROP TABLE "partner_payouts";

-- CreateTable
CREATE TABLE "otp_verifications" (
    "id" BIGSERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "otp_code" VARCHAR(10) NOT NULL,
    "expires_at" TIMESTAMP NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" BIGINT,

    CONSTRAINT "otp_verifications_pkey" PRIMARY KEY ("id")
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
    "status" VARCHAR(20) NOT NULL DEFAULT 'UNPAID',
    "payment_evidence_url" TEXT,
    "processed_by" BIGINT,
    "processed_at" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "partner_commission_bills_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "otp_verifications_email_key" ON "otp_verifications"("email");

-- CreateIndex
CREATE UNIQUE INDEX "partner_commission_bills_bill_code_key" ON "partner_commission_bills"("bill_code");

-- AddForeignKey
ALTER TABLE "otp_verifications" ADD CONSTRAINT "otp_verifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_commission_bills" ADD CONSTRAINT "partner_commission_bills_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partner_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_commission_bills" ADD CONSTRAINT "partner_commission_bills_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
