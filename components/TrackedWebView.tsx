import { Colors } from "@/constants/Colors";
import { db } from "@/db/drizzle";
import { tChapters, tTags, tWorks } from "@/db/schema";
import { readWebViewScript } from "@/util/readWebViewScript";
import {
  type TWorkInfoEvent,
  parseNavStateUrl,
  parseWorkInfoEvent,
  parseWorkTagsEvent,
  workInfoEvent,
  workTagsInfoEvent,
} from "@/util/workInfoParser";
import { onConflictDoUpdateConfig } from "@qcksys/drizzle-extensions/onConflictDoUpdate";
import { and, eq, gt } from "drizzle-orm";
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

const onMessage = async (event: WebViewMessageEvent) => {
  const eventData = JSON.parse(event.nativeEvent.data);
  switch (eventData.type) {
    case "workInfo": {
      await onMessageWorkInfo(eventData);
      return;
    }
    case "workTags": {
      await onMessageWorkTags(eventData);
      return;
    }
    default:
      console.warn(`Unknown event type: ${eventData.type}, Event: `, eventData);
      break;
  }
};
const onMessageWorkInfo = async (eventData: TWorkInfoEvent) => {
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
            author: workInfo.authorUsername,
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
};
const onMessageWorkTags = async (eventData: TWorkInfoEvent) => {
  const parsed = workTagsInfoEvent.safeParse(eventData);
  if (parsed.success) {
    const workUrl = new URL(parsed.data.url);
    const pathParts = workUrl.pathname.split("/").filter(Boolean);

    if (pathParts[0] !== "works" || Number.isNaN(Number(pathParts[1]))) {
      console.error("workTags sent on non-work page", parsed, eventData);
      return false;
    }

    const workId = Number(pathParts[1]);

    const tagsMoreRecentThanWorkUpdate = await db.$count(
      tTags,
      and(
        eq(tTags.workId, workId),
        gt(tTags.rowCreatedAt, new Date(parsed.data.workLastUpdated ?? "")),
      ),
    );

    if (!tagsMoreRecentThanWorkUpdate) {
      console.log(
        "No new tags to update for work",
        workId,
        "Skipping workTags update",
      );
      return;
    }

    const tags = parseWorkTagsEvent(parsed.data, workId);

    const tagsUpsert = await db
      .insert(tTags)
      .values(tags)
      .onConflictDoUpdate(
        onConflictDoUpdateConfig(tTags, { target: [tTags.workId, tTags.tag] }),
      );

    console.log("Work tags updated", tagsUpsert);
  } else {
    console.error("Error parsing workTags", parsed, eventData);
  }
  return;
};

export default TrackedWebView;
