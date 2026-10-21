-- CreateTable
CREATE TABLE "promotions" (
    "id" BIGSERIAL NOT NULL,
    "partner_id" BIGINT,
    "code" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "discount_percent" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "max_discount_amount" DECIMAL(12,2),
    "min_order_value" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "start_date" TIMESTAMP NOT NULL,
    "end_date" TIMESTAMP NOT NULL,
    "usage_limit" INTEGER NOT NULL DEFAULT 0,
    "used_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "promotions_code_key" ON "promotions"("code");

-- CreateIndex
CREATE INDEX "idx_promotions_dates" ON "promotions"("start_date", "end_date");
