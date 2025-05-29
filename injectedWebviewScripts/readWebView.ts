import { updateScrollPercentageToQueryParam } from "./shared/getPagePosition";
import { getWorkInfo } from "./shared/getWorkInfo";
import { getWorkTagInfo } from "./shared/getWorkTagInfo";
import { scrollTo } from "./shared/scrollTo";

declare global {
  interface Window {
    ReactNativeWebView: {
      postMessage(msg: string): void;
    };
  }
}

const url = new URL(window.location.href);
const urlParts = url.pathname.split("/").filter(Boolean);
const scrollToParam = url.searchParams.get("scrollTo");

// Run on works
if (urlParts[0] === "works") {
  window.addEventListener("scroll", updateScrollPercentageToQueryParam);
  window.ReactNativeWebView.postMessage(getWorkInfo());
  window.ReactNativeWebView.postMessage(getWorkTagInfo());
}

// Run if scrollToParam is present
if (scrollToParam) {
  scrollTo(scrollToParam);
}
