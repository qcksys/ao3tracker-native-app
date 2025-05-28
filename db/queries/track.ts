import { db } from "@/db/drizzle";
import { tChapters, tWorks } from "@/db/schema";
import { and, eq, max } from "drizzle-orm";

export const maxChapterNumberSubquery = db
  .select({
    workId: tChapters.workId,
    maxChapterNum: max(tChapters.chapterNumber).as("max_chapter_num"),
  })
  .from(tChapters)
  .groupBy(tChapters.workId)
  .as("mcn");

export const worksWithHighestChapter = db
  .select({
    id: tWorks.id,
    title: tWorks.title,
    totalChapters: tWorks.chapters,
    highestChapterNumber: tChapters.chapterNumber,
    highestChapterId: tChapters.id,
    highestChapterProgress: tChapters.lastChapterProgress,
    lastUpdated: tWorks.lastUpdated,
  })
  .from(tWorks)
  .leftJoin(
    maxChapterNumberSubquery,
    eq(tWorks.id, maxChapterNumberSubquery.workId),
  )
  .leftJoin(
    tChapters,
    and(
      eq(tChapters.workId, tWorks.id),
      eq(tChapters.chapterNumber, maxChapterNumberSubquery.maxChapterNum),
    ),
  );
