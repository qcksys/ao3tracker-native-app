import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { db } from "@/db/drizzle";
import { tChapters, tWorks } from "@/db/schema";
import Constants from "expo-constants";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from "react-native";

export default function TabSettingsScreen() {
  const [jsonData, setJsonData] = useState<string | null>(null);

  const exportDbAsJson = async () => {
    try {
      const works = await db.select().from(tWorks);
      const chapters = await db.select().from(tChapters);

      const dbContent = {
        works,
        chapters,
        exportDate: new Date().toISOString(),
      };

      const jsonContent = JSON.stringify(dbContent, null, 2);
      setJsonData(jsonContent);

      const fileName = `ao3tracker_backup_${new Date().toISOString().replace(/[:.]/g, "_")}.json`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, jsonContent);

      if (Platform.OS === "ios" || Platform.OS === "android") {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(filePath);
        } else {
          await Share.share({
            message: jsonContent,
            title: "AO3 Tracker Database Export",
          });
        }
      }

      Alert.alert(
        "Export Successful",
        "Database content has been exported as JSON",
      );
    } catch (error) {
      console.error("Failed to export database:", error);
      Alert.alert("Error", `Failed to export database: ${error}`);
    }
  };

  const clearDisplayedJson = () => {
    setJsonData(null);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Settings
      </ThemedText>

      <View style={styles.settingSection}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Database
        </ThemedText>

        <Pressable style={styles.settingButton} onPress={exportDbAsJson}>
          <ThemedText style={styles.buttonText}>
            Export Database as JSON
          </ThemedText>
        </Pressable>

        {jsonData && (
          <>
            <ScrollView style={styles.jsonContainer}>
              <ThemedText style={styles.jsonText}>{jsonData}</ThemedText>
            </ScrollView>

            <Pressable
              style={[styles.settingButton, styles.clearButton]}
              onPress={clearDisplayedJson}
            >
              <ThemedText style={styles.buttonText}>
                Clear JSON Display
              </ThemedText>
            </Pressable>
          </>
        )}
      </View>

      <View style={styles.settingSection}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          About
        </ThemedText>
        <ThemedText>Version: {Constants.expoConfig?.version}</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
    padding: 16,
  },
  title: {
    marginBottom: 20,
    textAlign: "center",
  },
  settingSection: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  settingButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 8,
  },
  clearButton: {
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  jsonContainer: {
    marginTop: 16,
    maxHeight: 300,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    backgroundColor: "#f7f7f7",
  },
  jsonText: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 12,
  },
});
