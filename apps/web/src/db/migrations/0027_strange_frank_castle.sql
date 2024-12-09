ALTER TABLE "subscription" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "subscription" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "subscription" ALTER COLUMN "orderId" SET DATA TYPE text;