import { db } from "@/db/drizzle";
import { tChapters, tWorks } from "@/db/schema";
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
import { ActivityIndicator, BackHandler, StyleSheet, View } from "react-native";
import {
  WebView,
  type WebViewMessageEvent,
  type WebViewNavigation,
  type WebViewProps,
} from "react-native-webview";

const TrackedWebView: React.FC<WebViewProps> = (props) => {
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
    console.log("effect");
  }, [props.source]);

  const handleWebViewNavigationStateChange = async (
    newNavState: WebViewNavigation,
  ) => {
    const { url } = newNavState;
    if (!url) return;

    if (lastNavState?.toString() !== url) {
      setLastNavState(new URL(url));

      const pageInfo = parseNavStateUrl(lastNavState);
      if (pageInfo.workId && pageInfo.chapterId) {
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
        injectedJavaScript={injectedJs}
        onNavigationStateChange={handleWebViewNavigationStateChange}
        onMessage={onMessage}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
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
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
});

const injectedJs = `
// injectedWebviewScripts/shared/getPagePosition.ts
var updateScrollPercentageToQueryParam = () => {
  const element = document.getElementById("chapters");
  let scrollPercentage;
  if (element) {
    const rect = element.getBoundingClientRect();
    const viewportTop = window.scrollY || window.pageYOffset;
    const elementAbsoluteTop = viewportTop + rect.top;
    const elementHeight = rect.height;
    if (elementHeight === 0) {
      return 0;
    }
    const scrollDistanceIntoElement = viewportTop - elementAbsoluteTop;
    let progress = 0;
    if (scrollDistanceIntoElement <= 0) {
      progress = 0;
    } else if (scrollDistanceIntoElement >= elementHeight) {
      progress = 100;
    } else {
      progress = scrollDistanceIntoElement / elementHeight * 100;
    }
    scrollPercentage = Math.max(0, Math.min(100, progress));
  }
  if (scrollPercentage === undefined || Number.isNaN(scrollPercentage)) {
    return;
  }
  const roundedScrollPercentage = Math.floor(scrollPercentage).toString();
  const url = new URL(window.location.href);
  const currentPercentage = url.searchParams.get("scroll");
  if (currentPercentage !== null && currentPercentage === roundedScrollPercentage) {
    return;
  }
  url.searchParams.set("scroll", roundedScrollPercentage);
  window.history.replaceState({}, "", url.toString());
};

// injectedWebviewScripts/shared/getWorkInfo.ts
var getWorkInfo = () => {
  return JSON.stringify({
    type: "workInfo",
    url: window.location.href,
    workName: document.querySelector("#workskin h2.title.heading")?.textContent?.trim(),
    workLastUpdated: (document.querySelector(".work.meta.group .stats dd.status") || document.querySelector(".work.meta.group .stats dd.published"))?.textContent?.trim(),
    chapterName: document.querySelector("#chapters div.chapter div.chapter.preface.group h3.title")?.textContent?.trim(),
    chapterNumber: document.querySelector("#chapters div.chapter")?.id,
    totalChapters: document.querySelector(".work.meta.group .stats dd.chapters")?.textContent?.trim(),
    authorUrl: document.querySelector("#workskin .byline.heading a")?.getAttribute("href")
  });
};

// injectedWebviewScripts/shared/scrollTo.ts
var scrollTo = (scrollToParam) => {
  const scrollPosition = Number.parseInt(scrollToParam, 10);
  const chaptersElement = document.getElementById("chapters");
  if (chaptersElement && !Number.isNaN(scrollPosition)) {
    const elementHeight = chaptersElement.getBoundingClientRect().height;
    const scrollTo2 = chaptersElement.offsetTop + elementHeight * scrollPosition / 100;
    window.scrollTo(0, scrollTo2);
  }
};

// injectedWebviewScripts/readWebView.ts
var url = new URL(window.location.href);
var urlParts = url.pathname.split("/").filter(Boolean);
var scrollToParam = url.searchParams.get("scrollTo");
if (urlParts[0] === "works") {
  window.addEventListener("scroll", updateScrollPercentageToQueryParam);
  window.ReactNativeWebView.postMessage(getWorkInfo());
}
if (scrollToParam) {
  scrollTo(scrollToParam);
}
`;

export default TrackedWebView;
