import { buildConflictUpdateColumns, db } from "@/db/drizzle";
import { tChapters } from "@/db/schema/chapters";
import { tWorks } from "@/db/schema/works";
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
  type WebViewNavigation,
  type WebViewProps,
} from "react-native-webview";
import injectedJavaScript from "../util/injectedJavaScript.webjs";

const TrackedWebView: React.FC<WebViewProps & { scrollPosition?: number }> = (
  props,
) => {
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
        await db
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

  return (
    <WebView
      {...props}
      ref={webviewRef}
      injectedJavaScript={injectedJavaScript}
      onNavigationStateChange={handleWebViewNavigationStateChange}
      onMessage={async (event) => {
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
                    id: workInfo.workUrlData.chapterId,
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
              }
            } else {
              console.error("Error parsing workInfo", parsed);
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
      }}
    />
  );
};

export default TrackedWebView;
