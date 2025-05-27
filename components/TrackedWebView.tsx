import { buildConflictUpdateColumns, db } from "@/db/drizzle";
import { tChapters, tWorks } from "@/db/schema";
import {
  parseNavStateUrl,
  parseWorkInfoEvent,
  workInfoEvent,
} from "@/util/workInfoParser";
import { and, eq } from "drizzle-orm";
import type React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";
import { BackHandler } from "react-native";
import {
  WebView,
  type WebViewMessageEvent,
  type WebViewNavigation,
  type WebViewProps,
} from "react-native-webview";

const TrackedWebView: React.FC<WebViewProps> = (props) => {
  const webviewRef = useRef<WebView>(null);
  const [lastNavState, setLastNavState] = useState<URL>(
    new URL(props.source && "uri" in props.source ? props.source.uri : ""),
  );
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
            const workInsert = await db
              .insert(tWorks)
              .values({
                id: workInfo.workUrlData.workId,
                title: workInfo.workName,
                chapters: workInfo.totalChapters,
                lastUpdated: workInfo.workLastUpdated,
              })
              .onConflictDoUpdate({
                target: tWorks.id,
                set: buildConflictUpdateColumns(tWorks, [
                  "lastUpdated",
                  "chapters",
                  "title",
                ]),
              });
            const chapterInsert = await db
              .insert(tChapters)
              .values({
                id: workInfo.workUrlData.chapterId ?? 0,
                workId: workInfo.workUrlData.workId,
                title: workInfo.chapterName,
                chapterNumber: workInfo.chapterNumber,
                lastRead: new Date(),
              })
              .onConflictDoUpdate({
                target: [tChapters.id, tChapters.workId],
                set: buildConflictUpdateColumns(tChapters, [
                  "title",
                  "chapterNumber",
                  "lastRead",
                ]),
              });
            console.log("workInfo DB Update", workInsert, chapterInsert);
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
    <WebView
      {...props}
      ref={webviewRef}
      injectedJavaScript={injectedJs}
      onNavigationStateChange={handleWebViewNavigationStateChange}
      onMessage={onMessage}
    />
  );
};

const injectedJs = `
function updateScrollPercentageToQueryParam() {
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
            progress = (scrollDistanceIntoElement / elementHeight) * 100;
        }

        scrollPercentage = Math.max(0, Math.min(100, progress));
    }

    if (scrollPercentage === undefined || Number.isNaN(scrollPercentage)) {
        return;
    }

    const roundedScrollPercentage = Math.floor(scrollPercentage).toString();

    const url = new URL(window.location.href);

    const currentPercentage = url.searchParams.get("scroll");

    if (
        currentPercentage !== null &&
        currentPercentage === roundedScrollPercentage
    ) {
        return;
    }

    url.searchParams.set("scroll", roundedScrollPercentage);

    window.history.replaceState({}, "", url.toString());
}

window.addEventListener("scroll", updateScrollPercentageToQueryParam);

const url = new URL(window.location.href);

const urlParts = url.pathname.split("/").filter(Boolean);

if (urlParts[0] === "works" && window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(
        JSON.stringify({
            type: "workInfo",
            url: window.location.href,
            workName: document.querySelector("#workskin h2.title.heading")?.textContent?.trim(),
            workLastUpdated: (document.querySelector(".work.meta.group .stats dd.status") || document.querySelector(".work.meta.group .stats dd.published"))?.innerText,
            chapterName: document.querySelector(
                "#chapters div.chapter div.chapter.preface.group h3.title",
            )?.textContent?.trim(),
            chapterNumber: document.querySelector("#chapters div.chapter")?.id,
            totalChapters: document.querySelector(
                ".work.meta.group .stats dd.chapters",
            )?.textContent?.trim(),
            authorUrl: document.querySelector("#workskin .byline.heading a")?.getAttribute("href"),
        }),
    );
}

const scrollToParam = url.searchParams.get("scrollTo");
if (scrollToParam) {
    const scrollPosition = parseInt(scrollToParam, 10);
    const chaptersElement = document.getElementById("chapters");

    if (chaptersElement && !isNaN(scrollPosition)) {
        const elementHeight = chaptersElement.getBoundingClientRect().height;
        const scrollTo = chaptersElement.offsetTop + (elementHeight * scrollPosition / 100);
        window.scrollTo(0, scrollTo);
    }
}
`;

export default TrackedWebView;
