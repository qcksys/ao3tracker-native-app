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
    new URL("https://archiveofourown.org/"),
  );
  // const [workInfo, setWorkInfo] = useState<TWorkInfo>();

  const pageInfo = parseNavStateUrl(lastNavState);

  // console.log(workInfo);
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
      onMessage={(event) => {
        const eventData = JSON.parse(event.nativeEvent.data);

        switch (eventData.type) {
          case "workInfo": {
            const parsed = workInfoEvent.safeParse(eventData);
            if (parsed.success) {
              console.log(parseWorkInfoEvent(parsed.data));
              // setWorkInfo(parseWorkInfoEvent(parsed.data));
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
