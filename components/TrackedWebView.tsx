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
"use strict";
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
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
        }
        else if (scrollDistanceIntoElement >= elementHeight) {
            progress = 100;
        }
        else {
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
    if (currentPercentage !== null &&
        currentPercentage === roundedScrollPercentage) {
        return;
    }
    url.searchParams.set("scroll", roundedScrollPercentage);
    window.history.replaceState({}, "", url.toString());
}
window.addEventListener("scroll", updateScrollPercentageToQueryParam);
const url = new URL(window.location.href);
const urlParts = url.pathname.split("/").filter(Boolean);
//@ts-ignore
if (urlParts[0] === "works" && window.ReactNativeWebView) {
    //@ts-ignore
    window.ReactNativeWebView.postMessage(JSON.stringify({
        type: "workInfo",
        url: window.location.href,
        workName: (_b = (_a = document
            .querySelector("#workskin h2.title.heading")) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim(),
        workLastUpdated: (_d = (_c = (document.querySelector(".work.meta.group .stats dd.status") ||
            document.querySelector(".work.meta.group .stats dd.published"))) === null || _c === void 0 ? void 0 : _c.textContent) === null || _d === void 0 ? void 0 : _d.trim(),
        chapterName: (_f = (_e = document
            .querySelector("#chapters div.chapter div.chapter.preface.group h3.title")) === null || _e === void 0 ? void 0 : _e.textContent) === null || _f === void 0 ? void 0 : _f.trim(),
        chapterNumber: (_g = document.querySelector("#chapters div.chapter")) === null || _g === void 0 ? void 0 : _g.id,
        totalChapters: (_j = (_h = document
            .querySelector(".work.meta.group .stats dd.chapters")) === null || _h === void 0 ? void 0 : _h.textContent) === null || _j === void 0 ? void 0 : _j.trim(),
        authorUrl: (_k = document
            .querySelector("#workskin .byline.heading a")) === null || _k === void 0 ? void 0 : _k.getAttribute("href"),
    }));
}
const scrollToParam = url.searchParams.get("scrollTo");
if (scrollToParam) {
    const scrollPosition = Number.parseInt(scrollToParam, 10);
    const chaptersElement = document.getElementById("chapters");
    if (chaptersElement && !Number.isNaN(scrollPosition)) {
        const elementHeight = chaptersElement.getBoundingClientRect().height;
        const scrollTo = chaptersElement.offsetTop + (elementHeight * scrollPosition) / 100;
        window.scrollTo(0, scrollTo);
    }
}

`;

export default TrackedWebView;
