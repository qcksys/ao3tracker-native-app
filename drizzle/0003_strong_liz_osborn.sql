CREATE INDEX `idx_chapters_rowCreatedAt` ON `chapters` (`rowCreatedAt`);--> statement-breakpoint
CREATE INDEX `idx_chapters_rowUpdatedAt` ON `chapters` (`rowUpdatedAt`);--> statement-breakpoint
CREATE INDEX `idx_chapters_rowDeletedAt` ON `chapters` (`rowDeletedAt`);--> statement-breakpoint
CREATE INDEX `idx_tags_rowCreatedAt` ON `tags` (`rowCreatedAt`);--> statement-breakpoint
CREATE INDEX `idx_works_rowCreatedAt` ON `works` (`rowCreatedAt`);--> statement-breakpoint
CREATE INDEX `idx_works_rowUpdatedAt` ON `works` (`rowUpdatedAt`);--> statement-breakpoint
CREATE INDEX `idx_works_rowDeletedAt` ON `works` (`rowDeletedAt`);