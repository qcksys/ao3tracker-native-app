import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
export const tWorks = sqliteTable(
  "works",
  {
    id: integer({ mode: "number" }).notNull().primaryKey(),
    title: text(),
    chapters: integer({ mode: "number" }),
    lastUpdated: integer({ mode: "timestamp" }),
    lastRead: integer({ mode: "timestamp" }),
    author: text(),
    rowCreatedAt: integer({ mode: "timestamp" })
      .$default(() => new Date())
      .notNull(),
    rowUpdatedAt: integer({ mode: "timestamp" })
      .$default(() => new Date())
      .$onUpdate(() => new Date())
      .notNull(),
    rowDeletedAt: integer({ mode: "timestamp" }),
  },
  (table) => {
    return [
      index("idx_works_rowCreatedAt").on(table.rowCreatedAt),
      index("idx_works_rowUpdatedAt").on(table.rowUpdatedAt),
      index("idx_works_rowDeletedAt").on(table.rowDeletedAt),
    ];
  },
);

export const sWorksI = createInsertSchema(tWorks);
export const sWorksS = createSelectSchema(tWorks);
export type TWorksS = InferSelectModel<typeof tWorks>;
export type TWorksI = InferInsertModel<typeof tWorks>;

export const tagTypes = {
  unknown: 0,
  rating: 1,
  warning: 2,
  category: 3,
  fandom: 4,
  relationship: 5,
  character: 6,
  freeform: 7,
} as const;
export type TTagTypes = typeof tagTypes;
export type TTagType = keyof TTagTypes;
export type TTagTypeId = TTagTypes[TTagType];

export const tTags = sqliteTable(
  "tags",
  {
    workId: integer({ mode: "number" }).notNull(),
    tag: text().notNull(),
    href: text().notNull(),
    typeId: integer({ mode: "number" }).$type<TTagTypeId>().notNull(),
    rowCreatedAt: integer({ mode: "timestamp" })
      .$default(() => new Date())
      .notNull(),
  },
  (table) => {
    return [
      primaryKey({ columns: [table.workId, table.tag] }),
      index("idx_tags_typeId").on(table.typeId),
      index("idx_tags_rowCreatedAt").on(table.rowCreatedAt),
    ];
  },
);

export const sTagsI = createInsertSchema(tTags);
export const sTagsS = createSelectSchema(tTags);
export type TTagsS = InferSelectModel<typeof tTags>;
export type TTagsI = InferInsertModel<typeof tTags>;

export const tChapters = sqliteTable(
  "chapters",
  {
    id: integer({ mode: "number" }).notNull(),
    workId: integer({ mode: "number" }).notNull(),
    title: text(),
    chapterNumber: integer({ mode: "number" }),
    lastChapterProgress: integer({ mode: "number" }),
    lastRead: integer({ mode: "timestamp" }),
    rowCreatedAt: integer({ mode: "timestamp" })
      .$default(() => new Date())
      .notNull(),
    rowUpdatedAt: integer({ mode: "timestamp" })
      .$default(() => new Date())
      .$onUpdate(() => new Date())
      .notNull(),
    rowDeletedAt: integer({ mode: "timestamp" }),
  },
  (table) => {
    return [
      primaryKey({ columns: [table.id, table.workId] }),
      index("idx_chapters_rowCreatedAt").on(table.rowCreatedAt),
      index("idx_chapters_rowUpdatedAt").on(table.rowUpdatedAt),
      index("idx_chapters_rowDeletedAt").on(table.rowDeletedAt),
    ];
  },
);

export const sChaptersI = createInsertSchema(tChapters);
export const sChaptersS = createSelectSchema(tChapters);

export type TChaptersS = InferSelectModel<typeof tChapters>;
export type TChaptersI = InferInsertModel<typeof tChapters>;
