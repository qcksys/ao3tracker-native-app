import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { db } from "@/db/drizzle";
import { tChapters, tWorks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import Constants from "expo-constants";
import { router, useLocalSearchParams } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from "react-native";

export default function TabTrackerScreen() {
  const localSearchParams = useLocalSearchParams<{
    workId?: string;
  }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const id = Number(localSearchParams.workId);

  if (Number.isNaN(id)) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>Work not found (NAN)</ThemedText>
      </ThemedView>
    );
  }

  const worksQuery = useLiveQuery(
    db.select().from(tWorks).where(eq(tWorks.id, id)),
  );
  const chaptersQuery = useLiveQuery(
    db.select().from(tChapters).where(eq(tChapters.workId, id)),
  );

  const work = worksQuery.data?.[0];
  const chapters = chaptersQuery.data;

  if (!work) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>Work not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.workDetailsContainer}>
        <ThemedText type="title" style={styles.title}>
          {work.title || "Untitled Work"}
        </ThemedText>

        <ThemedView style={styles.workInfoRow}>
          <ThemedText>
            Last Updated: {work.lastUpdated?.toLocaleDateString() || "Unknown"}
          </ThemedText>
          <Pressable
            style={styles.deleteWorkButton}
            onPress={(e) => {
              e.stopPropagation();
              confirmDeleteWork(work);
            }}
          >
            <IconSymbol
              size={24}
              name="trash.fill"
              color={colors.destructive}
            />
            <ThemedText style={{ color: colors.destructive }}>
              Delete Work
            </ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>
      <ScrollView style={styles.scrollContainer}>
        <ThemedView style={styles.chaptersContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Chapters
          </ThemedText>

          {chapters && chapters.length > 0 ? (
            chapters.map((chapter) => (
              <Pressable
                key={chapter.id}
                style={styles.chapterRow}
                onPress={(e) => {
                  e.stopPropagation();
                  onChapterPress(
                    work.id,
                    chapter.id,
                    chapter.lastChapterProgress ?? undefined,
                  );
                }}
              >
                <ThemedView style={styles.chapterInfo}>
                  <ThemedText style={styles.chapterTitle}>
                    {chapter.title || `Chapter ${chapter.chapterNumber || "?"}`}
                  </ThemedText>
                  {chapter.lastRead && (
                    <ThemedText style={styles.statusText}>
                      Last Read on {new Date(chapter.lastRead).toLocaleString()}
                    </ThemedText>
                  )}
                </ThemedView>
                <Pressable
                  style={styles.deleteButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    confirmDeleteChapter(chapter);
                  }}
                >
                  <IconSymbol
                    size={20}
                    name="trash.fill"
                    color={colors.destructive}
                  />
                </Pressable>
              </Pressable>
            ))
          ) : (
            <ThemedText style={styles.noDataText}>
              No chapters tracked yet
            </ThemedText>
          )}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  workDetailsContainer: {
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    marginBottom: 10,
    fontSize: 22,
    fontWeight: "bold",
  },
  workInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  summary: {
    marginTop: 10,
    fontStyle: "italic",
  },
  chaptersContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  chapterRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
  },
  chapterInfo: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 16,
  },
  statusText: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  deleteButton: {
    padding: 8,
  },
  deleteWorkButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  noDataText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
    opacity: 0.7,
  },
  errorText: {
    textAlign: "center",
    marginTop: 20,
  },
});

const deleteWork = async (workId: number) => {
  try {
    await db.delete(tChapters).where(eq(tChapters.workId, workId));
    await db.delete(tWorks).where(eq(tWorks.id, workId));
  } catch (error) {
    console.error("Failed to delete work:", error);
    Alert.alert("Error", `Failed to delete the work. ${error}`);
  }
};

const deleteChapter = async (chapterId: number) => {
  try {
    await db.delete(tChapters).where(eq(tChapters.id, chapterId));
  } catch (error) {
    console.error("Failed to delete chapter:", error);
    Alert.alert("Error", `Failed to delete the chapter. ${error}`);
  }
};

const confirmDeleteWork = (work: { id: number; title?: string | null }) => {
  Alert.alert(
    "Delete Work",
    `Are you sure you want to delete "${work.title ?? "undefined title"}" from your tracking history?`,
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

const confirmDeleteChapter = (chapter: {
  id: number;
  title?: string | null;
  number?: number | null;
}) => {
  const chapterName = chapter.title || `Chapter ${chapter.number || "?"}`;

  Alert.alert(
    "Delete Chapter",
    `Are you sure you want to delete "${chapterName}" from your tracking history?`,
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteChapter(chapter.id),
      },
    ],
  );
};

const onChapterPress = (
  workId: number,
  chapterId?: number,
  chapterProgress?: number,
) => {
  const workUrl = new URL(
    `https://archiveofourown.org/works/${workId}${
      chapterId ? `/chapters/${chapterId}` : ""
    }#workskin`,
  );
  if (chapterProgress) {
    workUrl.searchParams.set("scrollTo", chapterProgress.toString());
  }

  router.navigate({
    pathname: "/(tabs)/read",
    params: {
      uri: workUrl.toString(),
    },
  });
};
