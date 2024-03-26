-- CreateEnum
CREATE TYPE "Role" AS ENUM ('assistant', 'user', 'system', 'function', 'tool');

-- CreateTable
CREATE TABLE "Assistant" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "file_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "instructions" TEXT,
    "metadata" JSONB,
    "model" TEXT NOT NULL,
    "name" TEXT,
    "tools" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "object" TEXT NOT NULL DEFAULT 'assistant',

    CONSTRAINT "Assistant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreferences" (
    "id" TEXT NOT NULL,
    "preference" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assistant_id" TEXT NOT NULL,

    CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssistantFile" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "assistant_id" TEXT NOT NULL,
    "object" TEXT NOT NULL DEFAULT 'assistant.file',

    CONSTRAINT "AssistantFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" JSONB[],
    "file_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "role" "Role" NOT NULL,
    "assistant_id" TEXT,
    "thread_id" TEXT NOT NULL,
    "object" TEXT NOT NULL DEFAULT 'thread.message',

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserPreferences_assistant_id_id_idx" ON "UserPreferences"("assistant_id", "id");

-- CreateIndex
CREATE INDEX "AssistantFile_assistant_id_id_idx" ON "AssistantFile"("assistant_id", "id");

-- AddForeignKey
ALTER TABLE "UserPreferences" ADD CONSTRAINT "UserPreferences_assistant_id_fkey" FOREIGN KEY ("assistant_id") REFERENCES "Assistant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssistantFile" ADD CONSTRAINT "AssistantFile_assistant_id_fkey" FOREIGN KEY ("assistant_id") REFERENCES "Assistant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_assistant_id_fkey" FOREIGN KEY ("assistant_id") REFERENCES "Assistant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
