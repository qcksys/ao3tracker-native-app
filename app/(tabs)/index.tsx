import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { worksWithHighestChapter } from "@/db/queries/track";
import { tChapters, tWorks } from "@/db/schema";
import { useLiveTablesQuery } from "@qcksys/drizzle-extensions/useLiveTablesQuery";
import {} from "drizzle-orm";
import Constants from "expo-constants";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet } from "react-native";

export default function TabTrackerScreen() {
  const { data } = useLiveTablesQuery(worksWithHighestChapter, [
    tWorks,
    tChapters,
  ]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Tracked Works
      </ThemedText>

      {data.length === 0 ? (
        <ThemedText style={styles.noDataText}>No works tracked yet.</ThemedText>
      ) : (
        <ScrollView style={styles.tableContainer}>
          {data.map((work) => (
            <Pressable
              key={work.id}
              style={styles.tableRow}
              onPress={() => onWorkPress(work)}
            >
              <ThemedText style={[styles.tableCell]}>{work.title}</ThemedText>
              <ThemedText style={[styles.tableCell]}>
                {work.highestChapterNumber}(
                {work.highestChapterProgress?.toString() || "0"}%)/
                {work.totalChapters}
              </ThemedText>
              <ThemedText style={[styles.tableCell]}>
                Work Updated:{" "}
                {work.lastUpdated
                  ? work.lastUpdated.toLocaleDateString()
                  : "N/A"}
              </ThemedText>
            </Pressable>
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
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    marginBottom: 10,
    marginTop: 10,
    textAlign: "center",
  },
  tableContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
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

const onWorkPress = (work: Awaited<typeof worksWithHighestChapter>[number]) => {
  const workUrl = new URL(
    `https://archiveofourown.org/works/${work.id}${
      work.highestChapterId ? `/chapters/${work.highestChapterId}` : ""
    }#workskin`,
  );
  if (work.highestChapterProgress) {
    workUrl.searchParams.set(
      "scrollTo",
      work.highestChapterProgress.toString(),
    );
  }

  router.navigate({
    pathname: "/(tabs)/read",
    params: {
      uri: workUrl.toString(),
    },
  });
};
