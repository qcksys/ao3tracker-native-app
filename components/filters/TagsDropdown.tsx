import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  useColorScheme,
} from "react-native";

interface TagsDropdownProps {
  visible: boolean;
  tags: string[];
  selectedTags: string[] | string | undefined;
  onClose: () => void;
  onSelectTag: (tag: string) => void;
  isMultiSelect?: boolean;
}

export function TagsDropdown({
  visible,
  tags,
  selectedTags,
  onClose,
  onSelectTag,
  isMultiSelect = false,
}: TagsDropdownProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTags = searchQuery
    ? tags.filter((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : tags;

  if (!visible) return null;

  const isSelected = (tag: string) =>
    isMultiSelect
      ? Array.isArray(selectedTags) && selectedTags.includes(tag)
      : selectedTags === tag;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
        },
      ]}
    >
      <TextInput
        style={[
          styles.searchInput,
          {
            backgroundColor: colors.background,
            color: colors.foreground,
            borderColor: colors.border,
          },
        ]}
        placeholder="Search tags..."
        placeholderTextColor={colors.icon}
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoFocus
      />
      <FlatList
        data={filteredTags}
        keyExtractor={(item) => item}
        style={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.item,
              isSelected(item) && { backgroundColor: `${colors.primary}30` },
            ]}
            onPress={() => onSelectTag(item)}
          >
            <View style={styles.itemContent}>
              <ThemedText style={{ flex: 1 }} numberOfLines={1}>
                {item}
              </ThemedText>
              {isSelected(item) && isMultiSelect && (
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={colors.primary}
                />
              )}
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <ThemedText>No tags found</ThemedText>
          </View>
        }
      />
      <Pressable
        style={[styles.closeButton, { backgroundColor: colors.primary }]}
        onPress={onClose}
      >
        <ThemedText style={{ color: colors.background }}>Close</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    borderWidth: 1,
    borderRadius: 8,
    zIndex: 1000,
    padding: 8,
  },
  searchInput: {
    height: 36,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  list: {
    flex: 1,
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  emptyList: {
    padding: 10,
    alignItems: "center",
  },
  closeButton: {
    marginTop: 8,
    padding: 8,
    borderRadius: 4,
    alignItems: "center",
  },
});
