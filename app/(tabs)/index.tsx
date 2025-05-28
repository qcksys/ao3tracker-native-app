import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { db } from "@/db/drizzle";
import { worksWithHighestChapter } from "@/db/queries/track";
import { tChapters, tWorks } from "@/db/schema";
import { useLiveTablesQuery } from "@qcksys/drizzle-extensions/useLiveTablesQuery";
import { eq } from "drizzle-orm";
import Constants from "expo-constants";
import { router } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";

type Work = Awaited<typeof worksWithHighestChapter>[number];

export default function TabTrackerScreen() {
  const { data } = useLiveTablesQuery(worksWithHighestChapter, [
    tWorks,
    tChapters,
  ]);

  const deleteWork = async (workId: number) => {
    try {
      await db.delete(tChapters).where(eq(tChapters.workId, workId));
      await db.delete(tWorks).where(eq(tWorks.id, workId));
    } catch (error) {
      console.error("Failed to delete work:", error);
      Alert.alert("Error", `Failed to delete the work. ${error}`);
    }
  };

  const confirmDelete = (work: Work) => {
    Alert.alert(
      "Delete Work",
      `Are you sure you want to delete "${work.title}" from your tracking history?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteWork(work.id),
        },
      ],
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Tracked Works
      </ThemedText>

      {data.length === 0 ? (
        <ThemedText style={styles.noDataText}>No works tracked yet.</ThemedText>
      ) : (
        <ScrollView style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <View style={styles.tableRow}>
              <ThemedText style={[styles.tableCell, styles.headerCell]}>
                Title
              </ThemedText>
              <ThemedText style={[styles.tableCell, styles.headerCell]}>
                Status
              </ThemedText>
              <ThemedText style={[styles.tableCell, styles.headerCell]}>
                Date
              </ThemedText>
              <ThemedText style={[styles.tableCell, styles.headerCell]}>
                Actions
              </ThemedText>
            </View>
          </View>
          <View>
            {data.map((work) => (
              <Pressable
                key={work.id}
                style={styles.tableRow}
                onPress={() => onWorkPress(work)}
              >
                <ThemedText style={styles.tableCell}>{work.title}</ThemedText>
                <ThemedText style={styles.tableCell}>
                  {work.highestChapterNumber}(
                  {work.highestChapterProgress?.toString() || "0"}%)/
                  {work.totalChapters}
                </ThemedText>
                <ThemedText style={styles.tableCell}>
                  {work.lastUpdated
                    ? work.lastUpdated?.toLocaleDateString()
                    : "N/A"}
                </ThemedText>
                <Pressable
                  style={styles.deleteButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    confirmDelete(work);
                  }}
                >
                  <IconSymbol name="trash.fill" size={20} color="#ff3b30" />
                </Pressable>
              </Pressable>
            ))}
          </View>
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
  tableHeader: {
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
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
  },
  headerCellContainer: {
    flex: 1,
    paddingHorizontal: 5,
  },
  cellContainer: {
    flex: 1,
    paddingHorizontal: 5,
  },
  tableCell: {
    textAlign: "center",
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
  deleteButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
  },
});

const onWorkPress = (work: Work) => {
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
