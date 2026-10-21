-- CreateTable
CREATE TABLE "slot_overrides" (
    "id" BIGSERIAL NOT NULL,
    "service_id" BIGINT NOT NULL,
    "override_date" DATE NOT NULL,
    "start_time" TIME,
    "end_time" TIME,
    "price_modifier" DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    "is_closed" BOOLEAN NOT NULL DEFAULT false,
    "reason" VARCHAR(255),

    CONSTRAINT "slot_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "slot_overrides_service_id_override_date_start_time_key" ON "slot_overrides"("service_id", "override_date", "start_time");
