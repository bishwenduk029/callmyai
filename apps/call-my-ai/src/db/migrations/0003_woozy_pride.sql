ALTER TABLE "chat" ADD COLUMN "visitorId" text NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat" ADD CONSTRAINT "chat_visitorId_user_id_fk" FOREIGN KEY ("visitorId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
