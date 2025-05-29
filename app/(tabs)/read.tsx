import { ThemedView } from "@/components/ThemedView";
import TrackedWebView from "@/components/TrackedWebView";
import { ao3Url } from "@/constants/AO3";
import Constants from "expo-constants";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { StyleSheet } from "react-native";

export default function TabReadScreen() {
  const { uri } = useLocalSearchParams<{
    uri?: string;
  }>();
  const initialUri = typeof uri === "string" ? uri : `${ao3Url}/`;

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
