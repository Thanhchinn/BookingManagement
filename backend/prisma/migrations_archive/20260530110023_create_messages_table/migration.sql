-- CreateTable
CREATE TABLE "messages" (
    "id" BIGSERIAL NOT NULL,
    "chat_room_id" BIGINT NOT NULL,
    "sender_id" BIGINT NOT NULL,
    "message_text" TEXT NOT NULL,
    "type" VARCHAR(20) NOT NULL DEFAULT 'TEXT',
    "attachments" JSONB,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_messages_room_time" ON "messages"("chat_room_id", "created_at");
