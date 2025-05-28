import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { db } from "@/db/drizzle";
import { tChapters, tWorks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import Constants from "expo-constants";
import { useLocalSearchParams } from "expo-router";
import { Alert, Pressable, StyleSheet, useColorScheme } from "react-native";

export default function TabTrackerScreen() {
  const localSearchParams = useLocalSearchParams<{
    workId?: string;
  }>();

  const id = Number(localSearchParams.workId);

  if (Number.isNaN(id)) {
    return null;
  }

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const worksQuery = useLiveQuery(
    db.select().from(tWorks).where(eq(tWorks.id, id)),
  );
  const chaptersQuery = useLiveQuery(
    db.select().from(tChapters).where(eq(tChapters.workId, id)),
  );

  const work = worksQuery.data?.[0];
  const chapters = chaptersQuery.data;

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Tracked Work {id}
      </ThemedText>
      <Pressable
        style={[styles.actionsCell]}
        onPress={(e) => {
          e.stopPropagation();
          confirmDelete(worksQuery.data[0]);
        }}
      >
        <IconSymbol size={40} name="trash.fill" color={colors.primary} />
      </Pressable>
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

const deleteWork = async (workId: number) => {
  try {
    await db.delete(tChapters).where(eq(tChapters.workId, workId));
    await db.delete(tWorks).where(eq(tWorks.id, workId));
  } catch (error) {
    console.error("Failed to delete work:", error);
    Alert.alert("Error", `Failed to delete the work. ${error}`);
  }
};

const confirmDelete = (work: { id: number; title?: string | null }) => {
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
