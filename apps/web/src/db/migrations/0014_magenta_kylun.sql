CREATE TABLE IF NOT EXISTS "assistant" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"prompt" text NOT NULL,
	"duration" integer NOT NULL,
	"userId" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "assistant" ADD CONSTRAINT "assistant_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "assistant_id_idx" ON "assistant" ("id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "assistant_userId_idx" ON "assistant" ("userId");