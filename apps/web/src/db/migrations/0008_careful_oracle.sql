ALTER TABLE "user" ALTER COLUMN "calls" SET DEFAULT 50;--> statement-breakpoint
ALTER TABLE "chat" ADD COLUMN "duration" integer NOT NULL;