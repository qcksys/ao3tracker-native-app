import { Colors } from "@/constants/Colors";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

export default function IndexStackLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <Stack initialRouteName="index">
      <Stack.Screen
        name="index"
        options={{ title: "Track", headerShown: false }}
      />
      <Stack.Screen
        name="[workId]"
        options={{ title: "Details", headerShown: false }}
      />
    </Stack>
  );
}
