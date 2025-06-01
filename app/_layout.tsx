import { db, expoDb } from "@/db/drizzle";
import { posthog } from "@/util/posthog";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import * as Sentry from "@sentry/react-native";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useSQLiteDevTools } from "expo-sqlite-devtools";
import { useEffect } from "react";
import migrations from "../drizzle/migrations";

Sentry.init({
  dsn: "https://0fd570fff857dee0867e86a30a7a4325@o4507101986291712.ingest.de.sentry.io/4509406248173648",
  sendDefaultPii: true,
});

function App() {
  useEffect(() => {
    posthog.capture("app_load", { error: false });
  }, []);

  const migration = useMigrations(db, migrations);
  if (migration.error) {
    console.error("Migration Error:", migration.error);
    posthog.capture("drizzle_migrate_error", {
      error: true,
      message: JSON.stringify(migration.error),
    });
    return null;
  }

  useSQLiteDevTools(expoDb);

  if (!migration.success) {
    return null;
  }

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

function AppProviders() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <App />
    </ThemeProvider>
  );
}

export default Sentry.wrap(AppProviders);
