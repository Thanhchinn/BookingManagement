-- CreateTable
CREATE TABLE "chat_room_members" (
    "id" BIGSERIAL NOT NULL,
    "chat_room_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "last_read_at" TIMESTAMP,

    CONSTRAINT "chat_room_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chat_room_members_chat_room_id_user_id_key" ON "chat_room_members"("chat_room_id", "user_id");
