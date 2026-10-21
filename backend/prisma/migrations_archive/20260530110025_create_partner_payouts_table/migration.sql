-- CreateTable
CREATE TABLE "partner_payouts" (
    "id" BIGSERIAL NOT NULL,
    "partner_id" BIGINT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "commission_deducted" DECIMAL(15,2) NOT NULL,
    "net_amount" DECIMAL(15,2) NOT NULL,
    "period_start" DATE,
    "period_end" DATE,
    "bank_account" VARCHAR(50),
    "bank_name" VARCHAR(100),
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "processed_by" BIGINT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partner_payouts_pkey" PRIMARY KEY ("id")
);
