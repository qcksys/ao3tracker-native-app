/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    overlay: "rgba(255, 255, 255, 0.7)",
    destructive: "#FF3B30",
    border: "#ccc",
    primary: "#007AFF",
    buttonText: "#FFFFFF",
    codeBackground: "#f7f7f7",
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    overlay: "rgba(21, 23, 24, 0.7)",
    destructive: "#FF3B30",
    border: "#444",
    primary: "#0A84FF",
    buttonText: "#FFFFFF",
    codeBackground: "#252628",
  },
} as const;
