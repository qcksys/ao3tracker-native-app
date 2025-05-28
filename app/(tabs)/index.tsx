import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { db } from "@/db/drizzle";
import { worksWithHighestChapter } from "@/db/queries/track";
import { tChapters, tWorks } from "@/db/schema";
import { useLiveTablesQuery } from "@qcksys/drizzle-extensions/useLiveTablesQuery";
import { eq } from "drizzle-orm";
import Constants from "expo-constants";
import { router } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";

type Work = Awaited<typeof worksWithHighestChapter>[number];

export default function TabTrackerScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

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
        <ThemedText style={[styles.noDataText, { color: colors.icon }]}>
          No works tracked yet.
        </ThemedText>
      ) : (
        <ScrollView
          style={[styles.tableContainer, { borderColor: colors.icon }]}
        >
          <View
            style={[
              styles.tableHeader,
              {
                backgroundColor: colors.overlay,
                borderBottomColor: colors.icon,
              },
            ]}
          >
            <View style={styles.tableRow}>
              <ThemedText
                style={[styles.tableCell, styles.headerCell, styles.titleCell]}
              >
                Title
              </ThemedText>
              <ThemedText
                style={[styles.tableCell, styles.headerCell, styles.statusCell]}
              >
                Info
              </ThemedText>
              <ThemedText
                style={[
                  styles.tableCell,
                  styles.headerCell,
                  styles.actionsCell,
                ]}
              >
                <IconSymbol
                  size={24}
                  name="gearshape.fill"
                  color={colors.icon}
                />
              </ThemedText>
            </View>
          </View>
          <View>
            {data.map((work) => (
              <Pressable
                key={work.id}
                style={[styles.tableRow, { borderBottomColor: colors.border }]}
                onPress={() => onWorkPress(work)}
              >
                <ThemedText style={[styles.tableCell, styles.titleCell]}>
                  {work.title}
                </ThemedText>
                <View style={styles.statusCell}>
                  <ThemedText style={[styles.tableCell, styles.statusText]}>
                    Chapter: {work.highestChapterNumber}(
                    {work.highestChapterProgress?.toString() || "0"}%)/
                    {work.totalChapters}
                  </ThemedText>
                  <ThemedText style={[styles.tableCell, styles.statusText]}>
                    {work.lastUpdated
                      ? `Updated: ${work.lastUpdated?.toLocaleDateString()}`
                      : "N/A"}
                  </ThemedText>
                </View>
                <Pressable
                  style={[styles.deleteButton, styles.actionsCell]}
                  onPress={(e) => {
                    e.stopPropagation();
                    confirmDelete(work);
                  }}
                >
                  <IconSymbol
                    name="trash.fill"
                    size={20}
                    color={colors.destructive}
                  />
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
    overflow: "hidden",
  },
  tableHeader: {
    borderBottomWidth: 1,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingVertical: 10,
    backgroundColor: "transparent",
    width: "100%",
  },
  headerCell: {
    fontWeight: "bold",
  },
  titleCell: {
    width: "50%",
    paddingHorizontal: 5,
  },
  statusCell: {
    width: "40%",
    paddingHorizontal: 5,
    justifyContent: "center",
  },
  actionsCell: {
    width: "10%",
    paddingHorizontal: 5,
    alignItems: "center",
  },
  tableCell: {
    textAlign: "left",
  },
  statusText: {
    textAlign: "left",
    fontSize: 12,
  },
  noDataText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
  },
  errorText: {
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
