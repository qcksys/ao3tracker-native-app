import * as schema from "@/db/schema";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";

export const expoDb = openDatabaseSync("db_v1.db", {
  enableChangeListener: true,
});
export const db = drizzle(expoDb, { schema });
