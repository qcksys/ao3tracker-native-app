import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { worksWithHighestChapter } from "@/db/queries/track";
import { tChapters, tTags, tWorkTags, tWorks } from "@/db/schema";
import { useLiveTablesQuery } from "@qcksys/drizzle-extensions/useLiveTablesQuery";
import Constants from "expo-constants";
import { router } from "expo-router";
import {
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
    tTags,
    tWorkTags,
  ]);

  const goToAo3Homepage = () => {
    const ao3Url = "https://archiveofourown.org/";
    router.navigate({
      pathname: "/(tabs)/read",
      params: {
        uri: ao3Url,
      },
    });
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerRow}>
        <ThemedText type="title" style={styles.title}>
          Tracked Works
        </ThemedText>
        <Pressable
          style={({ pressed }) => [
            styles.ao3Button,
            { backgroundColor: pressed ? colors.foreground : colors.primary },
          ]}
          onPress={goToAo3Homepage}
        >
          <ThemedText
            style={[styles.ao3ButtonText, { color: colors.background }]}
          >
            Browse AO3
          </ThemedText>
        </Pressable>
      </View>

      {data.length === 0 ? (
        <ThemedText style={[styles.noDataText, { color: colors.icon }]}>
          No works tracked yet.
        </ThemedText>
      ) : (
        <View style={[styles.tableContainer, { borderColor: colors.icon }]}>
          <View style={styles.tableHeader}>
            <ThemedText
              style={[styles.tableCell, styles.headerCell, styles.cell50]}
            >
              Title
            </ThemedText>
            <ThemedText
              style={[styles.tableCell, styles.headerCell, styles.cell50]}
            >
              Info
            </ThemedText>
          </View>
          <ScrollView>
            <View>
              {data.map((work) => (
                <Pressable
                  key={work.id}
                  style={[
                    styles.tableRow,
                    { borderBottomColor: colors.border },
                  ]}
                  onPress={() => onWorkPress(work)}
                >
                  <View style={styles.workRow}>
                    <View style={styles.cell90}>
                      <ThemedText>{work.title}</ThemedText>
                      <ThemedText style={[styles.statusText, styles.italic]}>
                        {work.fandoms || "Unknown Fandoms"}
                      </ThemedText>
                    </View>
                    <Pressable
                      style={styles.cell10}
                      onPress={(e) => {
                        e.stopPropagation();
                        router.navigate({
                          pathname: "/(tabs)/details",
                          params: {
                            workId: work.id,
                          },
                        });
                      }}
                    >
                      <IconSymbol
                        size={40}
                        name="list.bullet"
                        color={colors.primary}
                      />
                    </Pressable>
                  </View>
                  <View style={styles.workRow}>
                    <View style={styles.cell50}>
                      <ThemedText style={[styles.tableCell, styles.statusText]}>
                        By: {work.author || "Unknown"}
                      </ThemedText>
                      <ThemedText style={[styles.tableCell, styles.statusText]}>
                        Chapter: {work.highestChapterNumber}/
                        {work.totalChapters} (
                        {work.highestChapterProgress?.toString() || "0"}%)
                      </ThemedText>
                    </View>
                    <View style={styles.cell50}>
                      <ThemedText style={[styles.tableCell, styles.statusText]}>
                        Updated:{" "}
                        {work.lastUpdated
                          ? work.lastUpdated?.toLocaleDateString()
                          : "N/A"}
                      </ThemedText>
                      <ThemedText style={[styles.tableCell, styles.statusText]}>
                        Read:{" "}
                        {work.lastRead
                          ? work.lastRead?.toLocaleString()
                          : "Never"}
                      </ThemedText>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  ao3Button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  ao3ButtonText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  title: {
    flex: 1,
  },
  tableContainer: {
    flex: 1,
    borderWidth: 1,
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "column",
    borderBottomWidth: 1,
    paddingVertical: 5,
    backgroundColor: "transparent",
    width: "100%",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingVertical: 10,
    backgroundColor: "transparent",
    width: "100%",
    paddingHorizontal: 10,
  },
  workRow: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 10,
  },
  row: {
    flexDirection: "row",
  },
  rowEnd: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  headerCell: {
    fontWeight: "bold",
  },
  cell: {
    paddingHorizontal: 5,
  },
  cell10: {
    width: "10%",
  },
  cell50: {
    width: "50%",
  },
  cell90: {
    width: "90%",
  },
  italic: {
    fontStyle: "italic",
  },
  tableCell: {
    textAlign: "left",
  },
  statusText: {
    fontSize: 14,
    lineHeight: 16,
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
