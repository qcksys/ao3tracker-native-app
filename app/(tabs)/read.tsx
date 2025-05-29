import { ThemedView } from "@/components/ThemedView";
import TrackedWebView from "@/components/TrackedWebView";
import Constants from "expo-constants";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { StyleSheet } from "react-native";

export default function TabReadScreen() {
  const { uri } = useLocalSearchParams<{
    uri?: string;
  }>();
  const initialUri =
    typeof uri === "string" ? uri : "https://archiveofourown.org/";

  useEffect(() => {
    console.log("opening browser on", initialUri);
  }, [initialUri]);

  return (
    <ThemedView style={styles.container}>
      <TrackedWebView
        source={{
          uri: initialUri,
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
