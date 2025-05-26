import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const tChapters = sqliteTable("chapters", {
  id: integer({ mode: "number" }),
  workId: integer({ mode: "number" }),
  title: text(),
  chapterNumber: integer({ mode: "number" }),
  lastChapterProgress: integer({ mode: "number" }),
  lastRead: integer({ mode: "timestamp" }),
});

export const sChaptersI = createInsertSchema(tChapters);
export const sChaptersS = createSelectSchema(tChapters);

export type TChaptersS = InferSelectModel<typeof tChapters>;
export type TChaptersI = InferInsertModel<typeof tChapters>;
