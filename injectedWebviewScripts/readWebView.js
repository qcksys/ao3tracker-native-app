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
