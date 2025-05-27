import { db, expoDb } from "@/db/drizzle";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Redirect, Stack } from "expo-router";
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
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded || !migration.success) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
      <Redirect href="/(tabs)/read" />
    </ThemeProvider>
  );
}
