import { Colors } from "@/constants/Colors";
import { db } from "@/db/drizzle";
import { tChapters, tWorks } from "@/db/schema";
import { readWebViewScript } from "@/util/readWebViewScript";
import {
  parseNavStateUrl,
  parseWorkInfoEvent,
  workInfoEvent,
} from "@/util/workInfoParser";
import { onConflictDoUpdateConfig } from "@qcksys/drizzle-extensions/onConflictDoUpdate";
import { and, eq } from "drizzle-orm";
import type React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";
import {
  ActivityIndicator,
  BackHandler,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";
import {
  WebView,
  type WebViewMessageEvent,
  type WebViewNavigation,
  type WebViewProps,
} from "react-native-webview";

const TrackedWebView: React.FC<WebViewProps> = (props) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const webviewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentUrl, setCurrentUrl] = useState<string>(
    props.source && "uri" in props.source ? props.source.uri : "",
  );
  const [lastNavState, setLastNavState] = useState<URL>(
    new URL(props.source && "uri" in props.source ? props.source.uri : ""),
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: currentUrl would make it load forever
  useEffect(() => {
    const newUrl =
      props.source && "uri" in props.source ? props.source.uri : "";
    if (new URL(newUrl).pathname !== new URL(currentUrl).pathname) {
      setIsLoading(true);
      setCurrentUrl(newUrl);
    }
  }, [props.source]);

  const handleWebViewNavigationStateChange = async (
    newNavState: WebViewNavigation,
  ) => {
    const { url } = newNavState;
    if (!url) return;

    if (lastNavState?.toString() !== url) {
      setLastNavState(new URL(url));

      const pageInfo = parseNavStateUrl(lastNavState);
      if (pageInfo.workId && (pageInfo.chapterId || pageInfo.chapterId === 0)) {
        const progressUpdate = await db
          .update(tChapters)
          .set({ lastChapterProgress: pageInfo.scroll })
          .where(
            and(
              eq(tChapters.id, pageInfo.chapterId),
              eq(tChapters.workId, pageInfo.workId),
            ),
          );
      }
    }
  };

  useEffect(() => {
    const handleBackButtonPress = () => {
      try {
        webviewRef.current?.goBack();
      } catch (err) {
        console.log(
          "[handleBackButtonPress] Error : ",
          err instanceof Error ? err.message : err,
        );
      }

      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackButtonPress,
    );
    return () => {
      backHandler.remove();
    };
  }, []);

  const onMessage = async (event: WebViewMessageEvent) => {
    const eventData = JSON.parse(event.nativeEvent.data);

    switch (eventData.type) {
      case "workInfo": {
        const parsed = workInfoEvent.safeParse(eventData);
        if (parsed.success) {
          const workInfo = parseWorkInfoEvent(parsed.data);

          if (workInfo.workUrlData.workId) {
            try {
              const workInsert = await db
                .insert(tWorks)
                .values({
                  id: workInfo.workUrlData.workId,
                  title: workInfo.workName,
                  chapters: workInfo.totalChapters,
                  lastUpdated: workInfo.workLastUpdated,
                  lastRead: new Date(),
                })
                .onConflictDoUpdate(onConflictDoUpdateConfig(tWorks));

              const chapterInsert = await db
                .insert(tChapters)
                .values({
                  id: workInfo.workUrlData.chapterId ?? 0,
                  workId: workInfo.workUrlData.workId,
                  title: workInfo.chapterName,
                  chapterNumber: workInfo.chapterNumber,
                  lastRead: new Date(),
                })
                .onConflictDoUpdate(
                  onConflictDoUpdateConfig(tChapters, {
                    target: [tChapters.id, tChapters.workId],
                  }),
                );

              console.log("workInfo DB Update", workInsert, chapterInsert);
            } catch (err) {
              console.error(err);
            }
          } else {
            console.warn("Work ID not found in workInfo event data", workInfo);
          }
        } else {
          console.error("Error parsing workInfo", parsed, eventData);
        }
        return;
      }
      default:
        console.warn(
          `Unknown event type: ${eventData.type}, Event: `,
          eventData,
        );
        break;
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        {...props}
        ref={webviewRef}
        injectedJavaScript={readWebViewScript}
        onNavigationStateChange={handleWebViewNavigationStateChange}
        onMessage={onMessage}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
      />
      {isLoading && (
        <View
          style={[
            styles.loadingOverlay,
            {
              backgroundColor: colors.overlay,
            },
          ]}
        >
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default TrackedWebView;
