import { db } from "@/db/drizzle";
import { tChapters } from "@/db/schema/chapters";
import { tWorks } from "@/db/schema/works";
import {
  parseNavStateUrl,
  parseWorkInfoEvent,
  workInfoEvent,
} from "@/util/workInfoParser";
import type React from "react";
import { useState } from "react";
import { useRef } from "react";
import {
  WebView,
  type WebViewNavigation,
  type WebViewProps,
} from "react-native-webview";
import injectedJavaScript from "../util/injectedJavaScript.webjs";

const TrackedWebView: React.FC<WebViewProps> = (props) => {
  const webviewRef = useRef<WebView>(null);
  const [lastNavState, setLastNavState] = useState<URL>(
    new URL(props.source && "uri" in props.source ? props.source.uri : ""),
  );

  const pageInfo = parseNavStateUrl(lastNavState);

  console.log(pageInfo);
  const handleWebViewNavigationStateChange = (
    newNavState: WebViewNavigation,
  ) => {
    const { url } = newNavState;
    if (!url) return;

    if (lastNavState?.toString() !== url) {
      setLastNavState(new URL(url));
    }
  };

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

              if (
                workInfo.workUrlData.workId &&
                workInfo.workUrlData.chapterId
              ) {
                await db.insert(tWorks).values({
                  id: workInfo.workUrlData.workId,
                  title: workInfo.workName,
                  chapters: workInfo.totalChapters,
                  lastUpdated: workInfo.workLastUpdated,
                });
                await db.insert(tChapters).values({
                  id: workInfo.workUrlData.chapterId,
                  workId: workInfo.workUrlData.workId,
                  title: workInfo.chapterName,
                  chapterNumber: workInfo.chapterNumber,
                  lastRead: new Date(),
                });
              }
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
