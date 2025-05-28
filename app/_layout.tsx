import { db, expoDb } from "@/db/drizzle";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useSQLiteDevTools } from "expo-sqlite-devtools";
import migrations from "../drizzle/migrations";

export default function RootLayout() {
  const migration = useMigrations(db, migrations);
  if (migration.error) {
    console.error("Migration Error:", migration.error);
    return null;
  }
  useSQLiteDevTools(expoDb);

  const colorScheme = useColorScheme();

  if (!migration.success) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
