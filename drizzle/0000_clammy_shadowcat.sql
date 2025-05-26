CREATE TABLE `chapters` (
	`id` integer,
	`workId` integer,
	`title` text,
	`chapterNumber` integer,
	`lastChapterProgress` integer,
	`lastRead` integer,
	PRIMARY KEY(`id`, `workId`)
);
--> statement-breakpoint
CREATE TABLE `works` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text,
	`chapters` integer,
	`lastUpdated` integer
);
