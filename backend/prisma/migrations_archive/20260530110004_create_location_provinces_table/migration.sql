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

-- CreateIndex
CREATE UNIQUE INDEX "location_provinces_province_code_key" ON "location_provinces"("province_code");

-- CreateIndex
CREATE UNIQUE INDEX "location_provinces_code_key" ON "location_provinces"("code");
