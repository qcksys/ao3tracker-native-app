import { Colors } from "@/constants/Colors";
import type { TTagType } from "@/db/schema";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View, useColorScheme } from "react-native";
import { ThemedText } from "../ThemedText";

type TagFilterProps = {
  type: TTagType;
  label: string;
  selectedTags: string[] | string | undefined;
  placeholder: string;
  onPress: () => void;
  onClearAll: () => void;
  isMultiSelect?: boolean;
  onRemoveTag?: (tag: string) => void;
};

export function TagFilter({
  type,
  label,
  selectedTags,
  placeholder,
  onPress,
  onClearAll,
  isMultiSelect = false,
  onRemoveTag,
}: TagFilterProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const hasSelectedTags = isMultiSelect
    ? Array.isArray(selectedTags) && selectedTags.length > 0
    : !!selectedTags;

  const tagCount = isMultiSelect
    ? Array.isArray(selectedTags)
      ? selectedTags.length
      : 0
    : selectedTags
      ? 1
      : 0;

  const displayText = () => {
    if (!hasSelectedTags) return placeholder;

    if (isMultiSelect && Array.isArray(selectedTags)) {
      return `${tagCount} ${type}${tagCount > 1 ? "s" : ""} selected`;
    }

    return selectedTags as string;
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <ThemedText style={styles.filterLabel}>
          {label} {tagCount > 0 && `(${tagCount})`}
        </ThemedText>
        {hasSelectedTags && (
          <Pressable style={styles.clearAllButton} onPress={onClearAll}>
            <ThemedText style={{ color: colors.primary, fontSize: 12 }}>
              {isMultiSelect ? "Clear All" : "Clear"}
            </ThemedText>
          </Pressable>
        )}
      </View>

      <Pressable
        style={[
          styles.dropdownButton,
          {
            backgroundColor: colors.background,
            borderColor: hasSelectedTags ? colors.primary : colors.border,
          },
        ]}
        onPress={onPress}
      >
        <ThemedText
          style={{
            color: hasSelectedTags ? colors.foreground : colors.icon,
            flex: 1,
          }}
          numberOfLines={1}
        >
          {displayText()}
        </ThemedText>
        <Ionicons name="chevron-down" size={16} color={colors.foreground} />
      </Pressable>

      {isMultiSelect &&
        Array.isArray(selectedTags) &&
        selectedTags.length > 0 && (
          <View style={styles.selectedTagsContainer}>
            {selectedTags.map((tag) => (
              <Pressable
                key={tag}
                style={[
                  styles.selectedTag,
                  { backgroundColor: `${colors.primary}20` },
                ]}
                onPress={() => onRemoveTag?.(tag)}
              >
                <ThemedText style={styles.selectedTagText} numberOfLines={1}>
                  {tag}
                </ThemedText>
                <Ionicons
                  name="close-circle"
                  size={14}
                  color={colors.primary}
                />
              </Pressable>
            ))}
          </View>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    position: "relative",
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  filterLabel: {
    fontWeight: "bold",
  },
  dropdownButton: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginTop: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  clearAllButton: {
    paddingHorizontal: 4,
  },
  selectedTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 6,
  },
  selectedTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    gap: 4,
    maxWidth: "100%",
  },
  selectedTagText: {
    fontSize: 12,
    maxWidth: "90%",
  },
});
