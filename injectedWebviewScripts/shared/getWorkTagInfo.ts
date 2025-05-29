import type { TWorkTagInfoEvent } from "../../util/workInfoParser";
const getArrayOfTagsFromAnchorElements = (type: string) => {
  const arrayOfAnchorElements: HTMLAnchorElement[] = Array.from(
    document.querySelectorAll(`.work.meta.group dd.${type}.tags a`),
  );
  return arrayOfAnchorElements.map((anchor: HTMLAnchorElement | null) => ({
    tag: anchor?.innerText,
    href: anchor?.getAttribute("href"),
  }));
};

export const getWorkTagInfo = () => {
  const workInfo: Partial<TWorkTagInfoEvent> = {
    type: "workTags",
    url: window.location.href,
    workLastUpdated: (
      document.querySelector(".work.meta.group .stats dd.status") ||
      document.querySelector(".work.meta.group .stats dd.published")
    )?.textContent?.trim(),
    rating: getArrayOfTagsFromAnchorElements("rating")[0],
    warning: [],
    category: getArrayOfTagsFromAnchorElements("category"),
    fandom: getArrayOfTagsFromAnchorElements("fandom"),
    relationship: getArrayOfTagsFromAnchorElements("relationship"),
    character: getArrayOfTagsFromAnchorElements("character"),
    freeform: getArrayOfTagsFromAnchorElements("freeform"),
  };

  return JSON.stringify(workInfo);
};
