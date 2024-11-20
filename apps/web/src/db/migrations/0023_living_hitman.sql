ALTER TABLE "plan" ADD COLUMN "allowedAssistants" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "subscription" DROP COLUMN IF EXISTS "subscriptionItemId";