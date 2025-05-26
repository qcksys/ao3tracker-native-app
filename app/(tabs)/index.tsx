import { ThemedView } from "@/components/ThemedView";
import TrackedWebView from "@/components/TrackedWebView";
import Constants from "expo-constants";
import { StyleSheet } from "react-native";

export default function TabReadScreen() {
  return (
    <ThemedView style={styles.container}>
      <TrackedWebView
        source={{
          uri: "https://archiveofourown.org/",
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
});
