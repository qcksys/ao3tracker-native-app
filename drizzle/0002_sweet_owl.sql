CREATE TABLE `tags` (
	`workId` integer NOT NULL,
	`tag` text NOT NULL,
	`href` text NOT NULL,
	`typeId` integer NOT NULL,
	`rowCreatedAt` integer NOT NULL,
	PRIMARY KEY(`workId`, `tag`)
);
--> statement-breakpoint
CREATE INDEX `idx_tags_typeId` ON `tags` (`typeId`);--> statement-breakpoint
ALTER TABLE `chapters` ADD `rowCreatedAt` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `chapters` ADD `rowUpdatedAt` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `chapters` ADD `rowDeletedAt` integer;--> statement-breakpoint
ALTER TABLE `works` ADD `author` text;--> statement-breakpoint
ALTER TABLE `works` ADD `rowCreatedAt` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `works` ADD `rowUpdatedAt` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `works` ADD `rowDeletedAt` integer;