CREATE TABLE `chapters` (
	`id` integer NOT NULL,
	`workId` integer NOT NULL,
	`title` text,
	`chapterNumber` integer,
	`lastChapterProgress` integer,
	`lastRead` integer,
	`rowCreatedAt` integer NOT NULL,
	`rowUpdatedAt` integer NOT NULL,
	`rowDeletedAt` integer,
	PRIMARY KEY(`id`, `workId`)
);
--> statement-breakpoint
CREATE INDEX `idx_chapters_rowCreatedAt` ON `chapters` (`rowCreatedAt`);--> statement-breakpoint
CREATE INDEX `idx_chapters_rowUpdatedAt` ON `chapters` (`rowUpdatedAt`);--> statement-breakpoint
CREATE INDEX `idx_chapters_rowDeletedAt` ON `chapters` (`rowDeletedAt`);--> statement-breakpoint
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
CREATE INDEX `idx_tags_rowCreatedAt` ON `tags` (`rowCreatedAt`);--> statement-breakpoint
CREATE TABLE `works` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text,
	`chapters` integer,
	`lastUpdated` integer,
	`lastRead` integer,
	`author` text,
	`rowCreatedAt` integer NOT NULL,
	`rowUpdatedAt` integer NOT NULL,
	`rowDeletedAt` integer
);
--> statement-breakpoint
CREATE INDEX `idx_works_rowCreatedAt` ON `works` (`rowCreatedAt`);--> statement-breakpoint
CREATE INDEX `idx_works_rowUpdatedAt` ON `works` (`rowUpdatedAt`);--> statement-breakpoint
CREATE INDEX `idx_works_rowDeletedAt` ON `works` (`rowDeletedAt`);