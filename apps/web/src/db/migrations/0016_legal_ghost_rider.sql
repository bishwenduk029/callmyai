ALTER TABLE "chat" ALTER COLUMN "userId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "chat" ADD COLUMN "assistantId" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat" ADD CONSTRAINT "chat_assistantId_assistant_id_fk" FOREIGN KEY ("assistantId") REFERENCES "public"."assistant"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_assistantId_idx" ON "chat" ("assistantId");