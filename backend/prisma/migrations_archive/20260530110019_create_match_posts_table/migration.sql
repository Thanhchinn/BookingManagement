-- CreateTable
CREATE TABLE "match_posts" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "service_id" BIGINT NOT NULL,
    "booking_id" BIGINT,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "play_date" DATE NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "skill_level" VARCHAR(20) NOT NULL DEFAULT 'ANY',
    "max_players" INTEGER NOT NULL,
    "current_players" INTEGER NOT NULL DEFAULT 1,
    "status" VARCHAR(20) NOT NULL DEFAULT 'OPEN',

    CONSTRAINT "match_posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_match_posts_date_status" ON "match_posts"("play_date", "status");
