-- CreateTable
CREATE TABLE "match_participants" (
    "id" BIGSERIAL NOT NULL,
    "match_post_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "note" TEXT,

    CONSTRAINT "match_participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "match_participants_match_post_id_user_id_key" ON "match_participants"("match_post_id", "user_id");
