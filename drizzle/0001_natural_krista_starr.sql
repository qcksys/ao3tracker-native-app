PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_chapters` (
	`id` integer NOT NULL,
	`workId` integer NOT NULL,
	`title` text,
	`chapterNumber` integer,
	`lastChapterProgress` integer,
	`lastRead` integer,
	PRIMARY KEY(`id`, `workId`)
);
--> statement-breakpoint
INSERT INTO `__new_chapters`("id", "workId", "title", "chapterNumber", "lastChapterProgress", "lastRead") SELECT "id", "workId", "title", "chapterNumber", "lastChapterProgress", "lastRead" FROM `chapters`;--> statement-breakpoint
DROP TABLE `chapters`;--> statement-breakpoint
ALTER TABLE `__new_chapters` RENAME TO `chapters`;--> statement-breakpoint
PRAGMA foreign_keys=ON;