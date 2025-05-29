import { Colors } from "@/constants/Colors";
import { Pressable, StyleSheet, View, useColorScheme } from "react-native";
import { ThemedText } from "../ThemedText";

interface StatusFilterProps {
  completedOnly: boolean | undefined;
  inProgressOnly: boolean | undefined;
  onToggleCompleted: () => void;
  onToggleInProgress: () => void;
}

export function StatusFilter({
  completedOnly,
  inProgressOnly,
  onToggleCompleted,
  onToggleInProgress,
}: StatusFilterProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View style={styles.container}>
      <ThemedText style={styles.filterLabel}>Status</ThemedText>
      <View style={styles.filterOptions}>
        <Pressable
          style={[
            styles.filterOption,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
            completedOnly && {
              backgroundColor: colors.primary,
            },
          ]}
          onPress={onToggleCompleted}
        >
          <ThemedText
            style={[
              styles.filterOptionText,
              completedOnly && { color: colors.background },
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
              borderColor: colors.border,
            },
            inProgressOnly && {
              backgroundColor: colors.primary,
            },
          ]}
          onPress={onToggleInProgress}
        >
          <ThemedText
            style={[
              styles.filterOptionText,
              inProgressOnly && { color: colors.background },
            ]}
          >
            In Progress
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  filterLabel: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 5,
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
});
