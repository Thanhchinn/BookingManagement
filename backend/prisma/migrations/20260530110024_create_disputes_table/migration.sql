-- CreateTable
CREATE TABLE "disputes" (
    "id" BIGSERIAL NOT NULL,
    "booking_id" BIGINT NOT NULL,
    "raised_by" BIGINT NOT NULL,
    "against_partner" BIGINT NOT NULL,
    "category" VARCHAR(30) NOT NULL,
    "description" TEXT NOT NULL,
    "evidence_urls" JSONB,
    "status" VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "resolved_by" BIGINT,
    "resolved_at" TIMESTAMP,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);
