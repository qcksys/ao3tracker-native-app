export const getWorkInfo = () => {
  return JSON.stringify({
    type: "workInfo",
    url: window.location.href,
    workName: document
      .querySelector("#workskin h2.title.heading")
      ?.textContent?.trim(),
    workLastUpdated: (
      document.querySelector(".work.meta.group .stats dd.status") ||
      document.querySelector(".work.meta.group .stats dd.published")
    )?.textContent?.trim(),
    chapterName: document
      .querySelector("#chapters div.chapter div.chapter.preface.group h3.title")
      ?.textContent?.trim(),
    chapterNumber: document.querySelector("#chapters div.chapter")?.id,
    totalChapters: document
      .querySelector(".work.meta.group .stats dd.chapters")
      ?.textContent?.trim(),
    authorUrl: document
      .querySelector("#workskin .byline.heading a")
      ?.getAttribute("href"),
  });
};
