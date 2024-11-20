ALTER TABLE "plan" ALTER COLUMN "duration" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "plan" ALTER COLUMN "allowedApps" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "plan" ALTER COLUMN "allowedFiles" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "plan" ALTER COLUMN "allowedCalls" DROP NOT NULL;--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'subscription'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "subscription" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "subscription" ALTER COLUMN "subscriptionItemId" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "subscription" drop column "subscriptionItemId";--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "subscriptionItemId" integer GENERATED ALWAYS AS (nextval('subscription_item_id_seq')) STORED NOT NULL;--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'webhookEvent'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "webhookEvent" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "plan" DROP COLUMN IF EXISTS "allowedAssistants";