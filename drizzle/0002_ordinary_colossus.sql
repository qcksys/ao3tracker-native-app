CREATE TABLE `tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tag` text NOT NULL,
	`href` text NOT NULL,
	`typeId` integer NOT NULL,
	`rowCreatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workTags` (
	`workId` integer NOT NULL,
	`tagId` integer NOT NULL,
	`linkedAt` integer NOT NULL,
	PRIMARY KEY(`workId`, `tagId`)
);
--> statement-breakpoint
ALTER TABLE `chapters` ADD `rowCreatedAt` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `chapters` ADD `rowUpdatedAt` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `chapters` ADD `rowDeletedAt` integer;--> statement-breakpoint
ALTER TABLE `works` ADD `rowCreatedAt` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `works` ADD `rowUpdatedAt` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `works` ADD `rowDeletedAt` integer;