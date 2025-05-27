import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
export const tWorks = sqliteTable("works", {
  id: integer({ mode: "number" }).notNull().primaryKey(),
  title: text(),
  chapters: integer({ mode: "number" }),
  lastUpdated: integer({ mode: "timestamp" }),
});

export const sWorksI = createInsertSchema(tWorks);
export const sWorksS = createSelectSchema(tWorks);
export type TWorksS = InferSelectModel<typeof tWorks>;
export type TWorksI = InferInsertModel<typeof tWorks>;

export const tChapters = sqliteTable(
  "chapters",
  {
    id: integer({ mode: "number" }).notNull(),
    workId: integer({ mode: "number" }).notNull(),
    title: text(),
    chapterNumber: integer({ mode: "number" }),
    lastChapterProgress: integer({ mode: "number" }),
    lastRead: integer({ mode: "timestamp" }),
  },
  (table) => {
    return [primaryKey({ columns: [table.id, table.workId] })];
  },
);

export const sChaptersI = createInsertSchema(tChapters);
export const sChaptersS = createSelectSchema(tChapters);

export type TChaptersS = InferSelectModel<typeof tChapters>;
export type TChaptersI = InferInsertModel<typeof tChapters>;
