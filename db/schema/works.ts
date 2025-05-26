import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
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
