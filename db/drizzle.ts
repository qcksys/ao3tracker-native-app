import { type SQL, getTableColumns, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import type { PgTable } from "drizzle-orm/pg-core";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import { openDatabaseSync } from "expo-sqlite";

export const expoDb = openDatabaseSync("db_v1.db", {
  enableChangeListener: true,
});
export const db = drizzle(expoDb);

export const buildConflictUpdateColumns = <
  T extends PgTable | SQLiteTable,
  Q extends keyof T["_"]["columns"],
>(
  table: T,
  columns: Q[],
) => {
  const cls = getTableColumns(table);
  return columns.reduce(
    (acc, column) => {
      const colName = cls[column].name;
      acc[column] = sql.raw(`excluded.${colName}`);
      return acc;
    },
    {} as Record<Q, SQL>,
  );
};
