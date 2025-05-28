/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    foreground: "#020618FF",
    background: "#FFFFFFFF",
    muted: "#F1F5F9FF",
    mutedForeground: "#62748EFF",
    accent: "#F1F5F9FF",
    accentForeground: "#0F172BFF",
    primary: "#0F172BFF",
    primaryForeground: "#F8FAFCFF",
    Secondary: "#f1f5f9",
    SecondaryForeground: "#0F172BFF",
    border: "#E2E8F0FF",
    destructive: "#E7000BFF",
    success: "#00E717FF",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    overlay: "#FFFFFFB2",
  },
  dark: {
    foreground: "#020618FF",
    background: "#F8FAFCFF",
    muted: "#1D293DFF",
    mutedForeground: "#90A1B9FF",
    accent: "#1D293DFF",
    accentForeground: "#F8FAFCFF",
    primary: "#E2E8F0FF",
    primaryForeground: "#0F172BFF",
    Secondary: "#1D293DFF",
    SecondaryForeground: "#F8FAFCFF",
    border: "#FFFFFF19",
    destructive: "#FF6467FF",
    success: "#52EC64FF",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    overlay: "#151718B2",
  },
} as const;
