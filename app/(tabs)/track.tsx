import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { db } from "@/db/drizzle";
import { tChapters } from "@/db/schema/chapters";
import { tWorks } from "@/db/schema/works";
import { eq, max } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import Constants from "expo-constants";
import { ScrollView, StyleSheet, View } from "react-native";

export default function TabTrackerScreen() {
  const { data } = useLiveQuery(
    db
      .select({
        id: tWorks.id,
        title: tWorks.title,
        totalChapters: tWorks.chapters,
        highestChapterNumber: max(tChapters.chapterNumber),
        lastUpdated: tWorks.lastUpdated,
      })
      .from(tWorks)
      .leftJoin(tChapters, eq(tWorks.id, tChapters.workId))
      .groupBy(tWorks.id, tWorks.title, tWorks.lastUpdated),
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Tracked Works
      </ThemedText>

      {data.length === 0 ? (
        <ThemedText style={styles.noDataText}>No works tracked yet.</ThemedText>
      ) : (
        <ScrollView style={styles.tableContainer}>
          <View style={styles.tableRow}>
            <ThemedText
              type="subtitle"
              style={[styles.tableCell, styles.headerCell]}
            >
              Title
            </ThemedText>
            <ThemedText
              type="subtitle"
              style={[styles.tableCell, styles.headerCell]}
            >
              Current Chapter
            </ThemedText>
            <ThemedText
              type="subtitle"
              style={[styles.tableCell, styles.headerCell]}
            >
              Chapters
            </ThemedText>
            <ThemedText
              type="subtitle"
              style={[styles.tableCell, styles.headerCell]}
            >
              Last Updated
            </ThemedText>
          </View>

          {data.map((work) => (
            <View key={work.id} style={styles.tableRow}>
              <ThemedText style={[styles.tableCell]}>{work.title}</ThemedText>
              <ThemedText style={[styles.tableCell]}>
                {work.highestChapterNumber}
              </ThemedText>
              <ThemedText style={[styles.tableCell]}>
                {work.totalChapters}
              </ThemedText>
              <ThemedText style={[styles.tableCell]}>
                {work.lastUpdated ? work.lastUpdated.toString() : "N/A"}
              </ThemedText>
            </View>
          ))}
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
    padding: 16,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    marginBottom: 20,
    textAlign: "center",
  },
  tableContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 10,
    backgroundColor: "transparent",
  },
  headerCell: {
    fontWeight: "bold",
    paddingVertical: 12,
  },
  tableCell: {
    flex: 1,
    textAlign: "center",
    paddingHorizontal: 5,
  },
  noDataText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
    color: "#888",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});
