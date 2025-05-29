import { Colors } from "@/constants/Colors";
import { getAllTags } from "@/db/queries/track";
import type { WorkFilter } from "@/db/queries/track";
import { type TTagType, tTags, tagTypes } from "@/db/schema";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { SearchFilter } from "./filters/SearchFilter";
import { StatusFilter } from "./filters/StatusFilter";
import { TagFilter } from "./filters/TagFilter";
import { TagsDropdown } from "./filters/TagsDropdown";

type TFilterModalProps = {
  visible: boolean;
  onClose: () => void;
  filter: WorkFilter;
  onApplyFilter: (filter: WorkFilter) => void;
};

export type TActiveTagTypes = Exclude<TTagType, "unknown" | "warning">;

export function FilterModal({
  visible,
  onClose,
  filter,
  onApplyFilter,
}: TFilterModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [tempFilter, setTempFilter] = React.useState<WorkFilter>(filter);
  const [activeDropdown, setActiveDropdown] = useState<TActiveTagTypes | null>(
    null,
  );

  const { data: tags } = useLiveQuery(getAllTags, [tTags]);

  // Create state for tag lists
  const [tagLists, setTagLists] = useState<Record<TActiveTagTypes, string[]>>({
    rating: [],
    category: [],
    fandom: [],
    relationship: [],
    character: [],
    freeform: [],
  });

  useEffect(() => {
    if (!tags) return;

    const newTagLists: Record<TActiveTagTypes, string[]> = {
      rating: [],
      category: [],
      fandom: [],
      relationship: [],
      character: [],
      freeform: [],
    };

    for (const tag of tags) {
      switch (tag.typeId) {
        case tagTypes.rating:
          newTagLists.rating.push(tag.tag);
          break;
        case tagTypes.category:
          newTagLists.category.push(tag.tag);
          break;
        case tagTypes.fandom:
          newTagLists.fandom.push(tag.tag);
          break;
        case tagTypes.relationship:
          newTagLists.relationship.push(tag.tag);
          break;
        case tagTypes.character:
          newTagLists.character.push(tag.tag);
          break;
        case tagTypes.freeform:
          newTagLists.freeform.push(tag.tag);
          break;
      }
    }

    setTagLists(newTagLists);
  }, [tags]);

  useEffect(() => {
    setTempFilter(filter);
  }, [filter]);

  const applyFilters = () => {
    onApplyFilter(tempFilter);
    onClose();
  };

  const resetFilters = () => {
    const emptyFilter: WorkFilter = {
      tags: {},
    };
    setTempFilter(emptyFilter);
    onApplyFilter(emptyFilter);
    onClose();
  };

  const toggleCompletedOnly = () => {
    setTempFilter((prev) => ({
      ...prev,
      completedOnly: !prev.completedOnly,
      inProgressOnly: prev.completedOnly ? prev.inProgressOnly : false,
    }));
  };

  const toggleInProgressOnly = () => {
    setTempFilter((prev) => ({
      ...prev,
      inProgressOnly: !prev.inProgressOnly,
      completedOnly: prev.inProgressOnly ? prev.completedOnly : false,
    }));
  };

  const toggleTagSelection = (tag: string, type: TTagType) => {
    setTempFilter((prev) => {
      if (type === "unknown" || type === "warning") return prev;

      const currentTags = prev.tags[type] || [];
      const updatedTags = currentTags.includes(tag)
        ? currentTags.filter((t) => t !== tag)
        : [...currentTags, tag];

      return {
        ...prev,
        tags: {
          ...prev.tags,
          [type]: updatedTags.length > 0 ? updatedTags : undefined,
        },
      };
    });
  };

  const clearTagsForType = (type: TTagType) => {
    setTempFilter((prev) => ({
      ...prev,
      tags: {
        ...prev.tags,
        [type]: undefined,
      },
    }));
  };

  const openDropdown = (type: TActiveTagTypes) => {
    setActiveDropdown(type);
  };

  const getTagsForType = (type: TTagType): string[] => {
    if (type === "unknown" || type === "warning") return [];

    return tagLists[type as TActiveTagTypes] || [];
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
          <ScrollView showsVerticalScrollIndicator={false}>
            <ThemedText type="title" style={styles.modalTitle}>
              Filter Works
            </ThemedText>

            <SearchFilter
              value={tempFilter.searchQuery}
              onChangeText={(text) =>
                setTempFilter((prev) => ({ ...prev, searchQuery: text }))
              }
              placeholder="Title or author"
              label="Search"
            />

            <TagFilter
              type="rating"
              label="Rating"
              selectedTags={tempFilter.tags.rating}
              placeholder="Select a rating"
              onPress={() => openDropdown("rating")}
              onClearAll={() => clearTagsForType("rating")}
              isMultiSelect={false}
            />
            <TagFilter
              type="category"
              label="Categories"
              selectedTags={tempFilter.tags.category}
              placeholder="Select categories"
              onPress={() => openDropdown("category")}
              onClearAll={() => clearTagsForType("category")}
              isMultiSelect={true}
              onRemoveTag={(tag) => toggleTagSelection(tag, "category")}
            />
            <TagFilter
              type="fandom"
              label="Fandoms"
              selectedTags={tempFilter.tags.fandom}
              placeholder="Select fandom(s)"
              onPress={() => openDropdown("fandom")}
              onClearAll={() => clearTagsForType("fandom")}
              isMultiSelect={true}
              onRemoveTag={(tag) => toggleTagSelection(tag, "fandom")}
            />
            <TagFilter
              type="relationship"
              label="Relationships"
              selectedTags={tempFilter.tags.relationship}
              placeholder="Select relationship(s)"
              onPress={() => openDropdown("relationship")}
              onClearAll={() => clearTagsForType("relationship")}
              isMultiSelect={true}
              onRemoveTag={(tag) => toggleTagSelection(tag, "relationship")}
            />
            <TagFilter
              type="character"
              label="Characters"
              selectedTags={tempFilter.tags.character}
              placeholder="Select character(s)"
              onPress={() => openDropdown("character")}
              onClearAll={() => clearTagsForType("character")}
              isMultiSelect={true}
              onRemoveTag={(tag) => toggleTagSelection(tag, "character")}
            />
            <TagFilter
              type="freeform"
              label="Freeform"
              selectedTags={tempFilter.tags.freeform}
              placeholder="Select freeform tag(s)"
              onPress={() => openDropdown("freeform")}
              onClearAll={() => clearTagsForType("freeform")}
              isMultiSelect={true}
              onRemoveTag={(tag) => toggleTagSelection(tag, "freeform")}
            />

            <StatusFilter
              completedOnly={tempFilter.completedOnly}
              inProgressOnly={tempFilter.inProgressOnly}
              onToggleCompleted={toggleCompletedOnly}
              onToggleInProgress={toggleInProgressOnly}
            />

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
              <ThemedText style={{ color: colors.foreground }}>
                Cancel
              </ThemedText>
            </Pressable>
          </ScrollView>

          <TagsDropdown
            visible={activeDropdown !== null}
            tags={activeDropdown ? getTagsForType(activeDropdown) : []}
            selectedTags={
              activeDropdown ? tempFilter.tags[activeDropdown] : undefined
            }
            onClose={() => setActiveDropdown(null)}
            onSelectTag={(tag) =>
              activeDropdown && toggleTagSelection(tag, activeDropdown)
            }
            isMultiSelect={activeDropdown !== "fandom"}
          />
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
    width: "90%",
    maxHeight: "90%",
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
