import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { db } from "@/db/drizzle";
import { tChapters, tWorks } from "@/db/schema";
import { and, eq, max } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import Constants from "expo-constants";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

export default function TabTrackerScreen() {
  const maxChapterNumberSubquery = db
    .select({
      workId: tChapters.workId,
      maxChapterNum: max(tChapters.chapterNumber).as("max_chapter_num"),
    })
    .from(tChapters)
    .groupBy(tChapters.workId)
    .as("mcn");
  const { data } = useLiveQuery(
    db
      .select({
        id: tWorks.id,
        title: tWorks.title,
        totalChapters: tWorks.chapters,
        highestChapterNumber: tChapters.chapterNumber,
        highestChapterId: tChapters.id,
        highestChapterProgress: tChapters.lastChapterProgress,
        lastUpdated: tWorks.lastUpdated,
      })
      .from(tWorks)
      .leftJoin(
        maxChapterNumberSubquery,
        eq(tWorks.id, maxChapterNumberSubquery.workId),
      )
      .leftJoin(
        tChapters,
        and(
          eq(tChapters.workId, tWorks.id),
          eq(tChapters.chapterNumber, maxChapterNumberSubquery.maxChapterNum),
        ),
      ),
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
              Chapter Progress
            </ThemedText>
            <ThemedText
              type="subtitle"
              style={[styles.tableCell, styles.headerCell]}
            >
              Work Last Updated
            </ThemedText>
          </View>

          {data.map((work) => (
            <Pressable
              key={work.id}
              style={styles.tableRow}
              onPress={() => {
                const workUrl = new URL(
                  `https://archiveofourown.org/works/${work.id}${
                    work.highestChapterId
                      ? `/chapters/${work.highestChapterId}`
                      : ""
                  }`,
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
              }}
            >
              <ThemedText style={[styles.tableCell]}>{work.title}</ThemedText>
              <ThemedText style={[styles.tableCell]}>
                {work.highestChapterNumber}(
                {work.highestChapterProgress?.toString() || "0"}%)/
                {work.totalChapters}
              </ThemedText>
              <ThemedText style={[styles.tableCell]}>
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
