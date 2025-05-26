import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Constants from "expo-constants";
import { StyleSheet } from "react-native";
export default function TabTrackerScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Track</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
});
