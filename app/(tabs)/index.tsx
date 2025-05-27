import { ThemedView } from "@/components/ThemedView";
import TrackedWebView from "@/components/TrackedWebView";
import { useRoute } from "@react-navigation/native";
import Constants from "expo-constants";
import { StyleSheet } from "react-native";

export default function TabReadScreen() {
  const route = useRoute();
  const initialUri = route.params?.uri ?? "https://archiveofourown.org/";

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
