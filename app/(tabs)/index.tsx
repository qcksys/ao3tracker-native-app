import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { db } from "@/db/drizzle";
import { worksWithHighestChapter } from "@/db/queries/track";
import { tChapters, tWorks } from "@/db/schema";
import { useLiveTablesQuery } from "@qcksys/drizzle-extensions/useLiveTablesQuery";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
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

  const deleteWork = async (workId: string) => {
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

  const columnHelper = createColumnHelper<Work>();

  const columns = [
    columnHelper.accessor("title", {
      cell: (info) => (
        <ThemedText style={styles.tableCell}>{info.getValue()}</ThemedText>
      ),
      header: "Title",
    }),
    columnHelper.accessor((row) => row, {
      id: "progress",
      cell: (info) => {
        const work = info.getValue();
        return (
          <ThemedText style={styles.tableCell}>
            {work.highestChapterNumber}(
            {work.highestChapterProgress?.toString() || "0"}%)/
            {work.totalChapters}
          </ThemedText>
        );
      },
      header: "Progress",
    }),
    columnHelper.accessor("lastUpdated", {
      cell: (info) => (
        <ThemedText style={styles.tableCell}>
          {info.getValue() ? info.getValue()?.toLocaleDateString() : "N/A"}
        </ThemedText>
      ),
      header: "Updated",
    }),
    columnHelper.accessor((row) => row, {
      id: "actions",
      cell: (info) => {
        const work = info.getValue();
        return (
          <Pressable
            style={styles.deleteButton}
            onPress={(e) => {
              e.stopPropagation();
              confirmDelete(work);
            }}
          >
            <IconSymbol name="trash.fill" size={20} color="#ff3b30" />
          </Pressable>
        );
      },
      header: "Actions",
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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
            {table.getHeaderGroups().map((headerGroup) => (
              <View key={headerGroup.id} style={styles.tableRow}>
                {headerGroup.headers.map((header) => (
                  <View key={header.id} style={styles.headerCellContainer}>
                    <ThemedText style={[styles.tableCell, styles.headerCell]}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </ThemedText>
                  </View>
                ))}
              </View>
            ))}
          </View>

          <View>
            {table.getRowModel().rows.map((row) => (
              <Pressable
                key={row.id}
                style={styles.tableRow}
                onPress={() => onWorkPress(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <View key={cell.id} style={styles.cellContainer}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </View>
                ))}
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
