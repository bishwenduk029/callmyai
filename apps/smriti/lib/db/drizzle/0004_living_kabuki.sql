ALTER TABLE `content` ADD `createdAt` integer DEFAULT (unixepoch() * 1000) NOT NULL;--> statement-breakpoint
ALTER TABLE `content` ADD `updatedAt` integer DEFAULT (unixepoch() * 1000) NOT NULL;--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `content` (`createdAt`);