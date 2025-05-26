CREATE TABLE `chapters` (
	`id` integer,
	`workId` integer,
	`title` text,
	`chapterNumber` integer,
	`lastChapterProgress` integer,
	`lastRead` integer
);
--> statement-breakpoint
CREATE TABLE `works` (
	`id` integer NOT NULL,
	`title` text,
	`chapters` integer,
	`lastUpdated` integer
);
