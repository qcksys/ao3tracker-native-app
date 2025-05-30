import { type TTagTypeId, type TTagsI, tagTypes } from "@/db/schema";
import { z } from "zod/v4";

export const workUrlInfoSchema = z.object({
  workId: z.number().nullable(),
  chapterId: z.number().nullable(),
  scroll: z.number().nullable(),
  url: z.instanceof(URL),
  pathParts: z.array(z.string()),
});

export type TWorkUrlInfo = z.infer<typeof workUrlInfoSchema>;

export const parseNavStateUrl = (url: URL): TWorkUrlInfo => {
  const pathParts = url.pathname.split("/").filter(Boolean);
  let workId: number | null = null;
  let chapterId: number;
  let scroll: number | null = null;

  if (pathParts[0] === "works" && !Number.isNaN(Number(pathParts[1]))) {
    workId = Number(pathParts[1]);
  }
  if (pathParts[2] === "chapters" && !Number.isNaN(Number(pathParts[3]))) {
    chapterId = Number(pathParts[3]);
  } else {
    chapterId = 0;
  }
  if (workId && url.searchParams.get("scroll")) {
    scroll = Number(url.searchParams.get("scroll"));
  }

  return {
    workId,
    chapterId,
    scroll,
    url,
    pathParts,
  };
};

export const workInfoEvent = z.object({
  type: z.literal("workInfo"),
  url: z.url(),
  authorUrl: z.string(),
  chapterName: z.string().optional(),
  chapterNumber: z.string().optional(),
  totalChapters: z.string(),
  workName: z.string(),
  workLastUpdated: z.string().optional(),
});

export type TWorkInfoEvent = z.infer<typeof workInfoEvent>;

export const workInfoSchema = z.object({
  url: z.url(),
  authorUsername: z.string(),
  chapterName: z.string(),
  chapterNumber: z.number().int(),
  totalChapters: z.number().int(),
  workName: z.string(),
  workLastUpdated: z.date().optional(),
  workUrlData: workUrlInfoSchema,
});

export type TWorkInfo = z.infer<typeof workInfoSchema>;

export const workTagEvent = z.object({
  tag: z.string().nullish(),
  href: z.string().nullish(),
});

export type TWorkTagEvent = z.infer<typeof workTagEvent>;

export const workTagsInfoEvent = z.object({
  type: z.literal("workTags"),
  url: z.url(),
  workLastUpdated: z.string().optional(),
  rating: workTagEvent,
  warning: z.array(workTagEvent),
  category: z.array(workTagEvent),
  fandom: z.array(workTagEvent),
  relationship: z.array(workTagEvent),
  character: z.array(workTagEvent),
  freeform: z.array(workTagEvent),
});

export type TWorkTagInfoEvent = z.infer<typeof workTagsInfoEvent>;

export const workTag = z.object({
  tag: z.string(),
  href: z.string(),
});

export const parseWorkInfoEvent = (workInfo: TWorkInfoEvent): TWorkInfo => {
  const totalChapters = workInfo.totalChapters.match(/^\d+/);
  const totalChaptersNumber = Number.parseInt(
    totalChapters ? totalChapters[0] : "0",
    10,
  );

  const singleChapterWork = totalChaptersNumber === 1;

  const chapterNumber = singleChapterWork
    ? ["1"]
    : workInfo.chapterNumber?.match(/\d+/);

  return {
    url: workInfo.url,
    authorUsername: workInfo.authorUrl.split("/").filter(Boolean)[1] ?? "",
    chapterName: workInfo.chapterName || workInfo.workName,
    chapterNumber: Number.parseInt(chapterNumber ? chapterNumber[0] : "0", 10),
    totalChapters: totalChaptersNumber,
    workName: workInfo.workName,
    workLastUpdated: workInfo.workLastUpdated
      ? new Date(workInfo.workLastUpdated)
      : undefined,
    workUrlData: parseNavStateUrl(new URL(workInfo.url)),
  };
};

export const parseWorkTagsEvent = (
  workTags: TWorkTagInfoEvent,
  workId: number,
) => {
  const workTagsInsert: TTagsI[] = [];

  tagDataToDbInsert(workTagsInsert, [workTags.rating], tagTypes.rating, workId);
  tagDataToDbInsert(workTagsInsert, workTags.warning, tagTypes.warning, workId);
  tagDataToDbInsert(
    workTagsInsert,
    workTags.category,
    tagTypes.category,
    workId,
  );
  tagDataToDbInsert(workTagsInsert, workTags.fandom, tagTypes.fandom, workId);
  tagDataToDbInsert(
    workTagsInsert,
    workTags.relationship,
    tagTypes.relationship,
    workId,
  );
  tagDataToDbInsert(
    workTagsInsert,
    workTags.character,
    tagTypes.character,
    workId,
  );
  tagDataToDbInsert(
    workTagsInsert,
    workTags.freeform,
    tagTypes.freeform,
    workId,
  );

  return workTagsInsert;
};

const tagDataToDbInsert = (
  workTagsInsert: TTagsI[],
  tags: TWorkTagEvent[],
  typeId: TTagTypeId,
  workId: number,
) => {
  for (const tag of tags) {
    if (tag.tag && tag.href) {
      workTagsInsert.push({
        workId,
        tag: tag.tag,
        href: tag.href,
        typeId,
        rowCreatedAt: new Date(),
      });
    }
  }
};
