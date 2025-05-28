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
