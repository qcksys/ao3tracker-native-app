import { Colors } from "@/constants/Colors";
import { StyleSheet, TextInput, View, useColorScheme } from "react-native";
import { ThemedText } from "../ThemedText";

interface SearchFilterProps {
  value: string | undefined;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
}

export function SearchFilter({
  value,
  onChangeText,
  placeholder = "Search...",
  label = "Search",
}: SearchFilterProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.background,
            color: colors.foreground,
            borderColor: colors.border,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.icon}
        value={value || ""}
        onChangeText={onChangeText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginTop: 2,
  },
});
