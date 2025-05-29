import { Colors } from "@/constants/Colors";
import type { WorkFilter } from "@/db/queries/track";
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filter: WorkFilter;
  onApplyFilter: (filter: WorkFilter) => void;
}

export function FilterModal({
  visible,
  onClose,
  filter,
  onApplyFilter,
}: FilterModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [tempFilter, setTempFilter] = React.useState<WorkFilter>(filter);

  React.useEffect(() => {
    setTempFilter(filter);
  }, [filter]);

  const applyFilters = () => {
    onApplyFilter(tempFilter);
    onClose();
  };

  const resetFilters = () => {
    const emptyFilter: WorkFilter = {};
    setTempFilter(emptyFilter);
    onApplyFilter(emptyFilter);
    onClose();
  };

  const toggleCompletedOnly = () => {
    setTempFilter((prev) => ({
      ...prev,
      completedOnly: !prev.completedOnly,
      inProgressOnly: prev.completedOnly ? prev.inProgressOnly : false, // Can't have both
    }));
  };

  const toggleInProgressOnly = () => {
    setTempFilter((prev) => ({
      ...prev,
      inProgressOnly: !prev.inProgressOnly,
      completedOnly: prev.inProgressOnly ? prev.completedOnly : false, // Can't have both
    }));
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <ThemedView style={styles.modalView}>
          <ThemedText type="title" style={styles.modalTitle}>
            Filter Works
          </ThemedText>

          <View style={styles.searchContainer}>
            <ThemedText style={styles.filterLabel}>Search</ThemedText>
            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: colors.background,
                  color: colors.foreground,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Title or author"
              placeholderTextColor={colors.icon}
              value={tempFilter.searchQuery || ""}
              onChangeText={(text) =>
                setTempFilter((prev) => ({ ...prev, searchQuery: text }))
              }
            />
          </View>

          <View style={styles.filterSection}>
            <ThemedText style={styles.filterLabel}>Status</ThemedText>
            <View style={styles.filterOptions}>
              <Pressable
                style={[
                  styles.filterOption,
                  tempFilter.completedOnly && {
                    backgroundColor: colors.primary,
                  },
                ]}
                onPress={toggleCompletedOnly}
              >
                <ThemedText
                  style={[
                    styles.filterOptionText,
                    tempFilter.completedOnly && { color: colors.background },
                  ]}
                >
                  Completed
                </ThemedText>
              </Pressable>

              <Pressable
                style={[
                  styles.filterOption,
                  {
                    backgroundColor: colors.background,
                  },
                  tempFilter.inProgressOnly && {
                    backgroundColor: colors.primary,
                  },
                ]}
                onPress={toggleInProgressOnly}
              >
                <ThemedText
                  style={[
                    styles.filterOptionText,
                    tempFilter.inProgressOnly && { color: colors.background },
                  ]}
                >
                  In Progress
                </ThemedText>
              </Pressable>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.button, { backgroundColor: colors.border }]}
              onPress={resetFilters}
            >
              <ThemedText style={styles.buttonText}>Reset</ThemedText>
            </Pressable>
            <Pressable
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={applyFilters}
            >
              <ThemedText
                style={[styles.buttonText, { color: colors.background }]}
              >
                Apply
              </ThemedText>
            </Pressable>
          </View>

          <Pressable style={[styles.closeButton]} onPress={onClose}>
            <ThemedText style={{ color: colors.foreground }}>Cancel</ThemedText>
          </Pressable>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    borderRadius: 10,
    padding: 20,
    width: "85%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: "center",
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginTop: 5,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    marginBottom: 5,
    fontWeight: "bold",
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  filterOption: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    minWidth: 100,
    alignItems: "center",
  },
  filterOptionText: {
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    fontWeight: "bold",
  },
  closeButton: {
    marginTop: 15,
    alignItems: "center",
  },
});
