CREATE TABLE `chapters` (
	`id` integer NOT NULL,
	`workId` integer NOT NULL,
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
