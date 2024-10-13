ALTER TABLE "integration" ALTER COLUMN "availableActions" SET DEFAULT ;--> statement-breakpoint
ALTER TABLE "integration" ADD COLUMN "appId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "integration" ADD COLUMN "key" text NOT NULL;--> statement-breakpoint
ALTER TABLE "integration" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "integration" ADD COLUMN "logo" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "integration_appId_idx" ON "integration" ("appId");