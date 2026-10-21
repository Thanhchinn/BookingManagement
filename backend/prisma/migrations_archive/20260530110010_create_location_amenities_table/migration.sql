-- CreateTable
CREATE TABLE "location_amenities" (
    "location_id" BIGINT NOT NULL,
    "amenity_id" BIGINT NOT NULL,

    CONSTRAINT "location_amenities_pkey" PRIMARY KEY ("location_id","amenity_id")
);
