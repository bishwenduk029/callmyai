ALTER TABLE "subscription" DROP CONSTRAINT "subscription_planId_plan_id_fk";
--> statement-breakpoint
ALTER TABLE "subscription" DROP COLUMN IF EXISTS "planId";