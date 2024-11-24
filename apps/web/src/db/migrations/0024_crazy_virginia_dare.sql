ALTER TABLE "subscription" ALTER COLUMN "planId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "duration" integer DEFAULT 75 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "allowedApps" integer DEFAULT 5 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "allowedFiles" integer DEFAULT 5 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "allowedCalls" integer DEFAULT 200 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "allowedAssistants" integer DEFAULT 3 NOT NULL;