-- CreateTable
CREATE TABLE "services" (
    "id" BIGSERIAL NOT NULL,
    "location_id" BIGINT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(30) NOT NULL,
    "sub_type" VARCHAR(50),
    "description" TEXT,
    "base_price_per_hour" DECIMAL(12,2) NOT NULL,
    "image_urls" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_services_category" ON "services"("category");
