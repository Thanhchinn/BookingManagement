-- CreateTable
CREATE TABLE "user_promotions" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "promotion_id" BIGINT NOT NULL,
    "used_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_promotions_pkey" PRIMARY KEY ("id")
);
