-- CreateTable
CREATE TABLE "chat_rooms" (
    "id" BIGSERIAL NOT NULL,
    "type" VARCHAR(20) NOT NULL DEFAULT 'INDIVIDUAL',
    "match_post_id" BIGINT,
    "name" VARCHAR(255),

    CONSTRAINT "chat_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chat_rooms_match_post_id_key" ON "chat_rooms"("match_post_id");
