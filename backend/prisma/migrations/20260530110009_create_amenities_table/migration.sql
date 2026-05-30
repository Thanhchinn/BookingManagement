-- CreateTable
CREATE TABLE "amenities" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "icon" VARCHAR(255),

    CONSTRAINT "amenities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "amenities_name_key" ON "amenities"("name");
