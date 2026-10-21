-- CreateTable
CREATE TABLE "location_wards" (
    "id" BIGSERIAL NOT NULL,
    "ward_code" VARCHAR(6) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "province_code" VARCHAR(2) NOT NULL,

    CONSTRAINT "location_wards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "location_wards_ward_code_key" ON "location_wards"("ward_code");
