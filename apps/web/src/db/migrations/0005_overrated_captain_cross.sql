ALTER TABLE "chat" ADD COLUMN "systemPromptOverride" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "systemPrompt" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account" ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_userId_idx" ON "chat" ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_visitorId_idx" ON "chat" ("visitorId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "message_chatId_idx" ON "message" ("chatId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session" ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_email_idx" ON "user" ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_username_idx" ON "user" ("username");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "verificationToken_identifier_idx" ON "verificationToken" ("identifier");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "verificationToken_token_idx" ON "verificationToken" ("token");