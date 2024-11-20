DO $$ BEGIN
 CREATE TYPE "public"."user_role" AS ENUM('USER', 'ADMIN');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"handle" text,
	"phoneNumber" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId"),
	CONSTRAINT "account_handle_unique" UNIQUE("handle")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "assistant" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"duration" integer NOT NULL,
	"phoneNumber" text,
	"userId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"callLimit" integer DEFAULT 50 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text,
	"assistantId" text,
	"visitorId" text,
	"summary" text,
	"title" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"systemPromptOverride" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "integration" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"connectedAccountName" text NOT NULL,
	"appId" text NOT NULL,
	"key" text NOT NULL,
	"description" text,
	"logo" text,
	"availableActions" text[] DEFAULT '{}',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "newsletterSubscriber" (
	"email" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plan" (
	"id" text PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"productName" text,
	"variantId" integer,
	"name" text NOT NULL,
	"description" text,
	"price" text NOT NULL,
	"isUsageBased" boolean DEFAULT false,
	"interval" text,
	"intervalCount" integer,
	"trialInterval" text,
	"trialIntervalCount" integer,
	"sort" integer,
	"duration" integer NOT NULL,
	"allowedApps" integer DEFAULT 0 NOT NULL,
	"allowedFiles" integer DEFAULT 0 NOT NULL,
	"allowedCalls" integer DEFAULT 0 NOT NULL,
	"allowedAssistants" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "promptTemplate" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscription" (
	"id" serial PRIMARY KEY NOT NULL,
	"lemonSqueezyId" text,
	"orderId" integer NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"statusFormatted" text NOT NULL,
	"renewsAt" text,
	"endsAt" text,
	"trialEndsAt" text,
	"price" text NOT NULL,
	"isUsageBased" boolean DEFAULT false,
	"isPaused" boolean DEFAULT false,
	"subscriptionItemId" serial NOT NULL,
	"userId" text NOT NULL,
	"planId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"role" "user_role" DEFAULT 'USER' NOT NULL,
	"name" text,
	"phone" text,
	"surname" text,
	"username" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"emailVerificationToken" text,
	"passwordHash" text,
	"resetPasswordToken" text,
	"resetPasswordTokenExpiry" timestamp,
	"image" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"calls" integer DEFAULT 50,
	CONSTRAINT "user_username_unique" UNIQUE("username"),
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_emailVerificationToken_unique" UNIQUE("emailVerificationToken"),
	CONSTRAINT "user_resetPasswordToken_unique" UNIQUE("resetPasswordToken")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "webhookEvent" (
	"id" serial PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"eventName" text NOT NULL,
	"processed" boolean DEFAULT false,
	"body" jsonb NOT NULL,
	"processingError" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "assistant" ADD CONSTRAINT "assistant_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat" ADD CONSTRAINT "chat_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat" ADD CONSTRAINT "chat_assistantId_assistant_id_fk" FOREIGN KEY ("assistantId") REFERENCES "public"."assistant"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat" ADD CONSTRAINT "chat_visitorId_user_id_fk" FOREIGN KEY ("visitorId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "integration" ADD CONSTRAINT "integration_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscription" ADD CONSTRAINT "subscription_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscription" ADD CONSTRAINT "subscription_planId_plan_id_fk" FOREIGN KEY ("planId") REFERENCES "public"."plan"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "assistant_id_idx" ON "assistant" USING btree ("id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "assistant_userId_idx" ON "assistant" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_userId_idx" ON "chat" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_assistantId_idx" ON "chat" USING btree ("assistantId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_visitorId_idx" ON "chat" USING btree ("visitorId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "integration_userId_idx" ON "integration" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "integration_appId_idx" ON "integration" USING btree ("appId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_username_idx" ON "user" USING btree ("username");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "verificationToken_identifier_idx" ON "verificationToken" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "verificationToken_token_idx" ON "verificationToken" USING btree ("token");