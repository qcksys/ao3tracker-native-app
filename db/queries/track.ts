import { db } from "@/db/drizzle";
import { tChapters, tTags, tWorks, tagTypes } from "@/db/schema";
import { and, desc, eq, like, lt, max, or, sql } from "drizzle-orm";

export const maxChapterNumberSubquery = db
  .select({
    workId: tChapters.workId,
    maxChapterNum: max(tChapters.chapterNumber).as("max_chapter_num"),
  })
  .from(tChapters)
  .groupBy(tChapters.workId)
  .as("mcn");

export type WorkFilter = {
  completedOnly?: boolean;
  inProgressOnly?: boolean;
  searchQuery?: string;
};

export const worksWithHighestChapter = (filter?: WorkFilter) => {
  const query = db
    .select({
      id: tWorks.id,
      title: tWorks.title,
      totalChapters: tWorks.chapters,
      author: tWorks.author,
      highestChapterNumber: tChapters.chapterNumber,
      highestChapterId: tChapters.id,
      highestChapterProgress: tChapters.lastChapterProgress,
      lastUpdated: tWorks.lastUpdated,
      lastRead: tWorks.lastRead,
      fandoms: sql<string>`GROUP_CONCAT(${tTags.tag}, ', ')`.as("fandoms"),
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
    )
    .leftJoin(
      tTags,
      and(eq(tTags.workId, tWorks.id), eq(tTags.typeId, tagTypes.fandom)),
    );

  const conditions = [];
  if (filter) {
    if (filter.completedOnly) {
      conditions.push(eq(tChapters.chapterNumber, tWorks.chapters));
    }
    if (filter.inProgressOnly) {
      conditions.push(lt(tChapters.chapterNumber, tWorks.chapters));
    }
    if (filter.searchQuery && filter.searchQuery.trim() !== "") {
      const searchTerm = `%${filter.searchQuery.trim()}%`;
      conditions.push(
        or(like(tWorks.title, searchTerm), like(tWorks.author, searchTerm)),
      );
    }
  }

  return query
    .where(
      conditions.length > 0
        ? conditions.length > 1
          ? and(...conditions)
          : conditions[0]
        : undefined,
    )
    .groupBy(
      tWorks.id,
      tWorks.title,
      tWorks.chapters,
      tWorks.author,
      tChapters.chapterNumber,
      tChapters.id,
      tChapters.lastChapterProgress,
      tWorks.lastUpdated,
      tWorks.lastRead,
    )
    .orderBy(desc(tWorks.lastRead));
};
