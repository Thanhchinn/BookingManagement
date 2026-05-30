-- CreateTable
CREATE TABLE "time_slots" (
    "id" BIGSERIAL NOT NULL,
    "service_id" BIGINT NOT NULL,
    "day_of_week" SMALLINT NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "price_modifier" DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "time_slots_service_id_day_of_week_start_time_key" ON "time_slots"("service_id", "day_of_week", "start_time");
