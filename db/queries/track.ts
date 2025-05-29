import { db } from "@/db/drizzle";
import { tChapters, tTags, tWorks, tagTypes } from "@/db/schema";
import {
  aliasedTable,
  and,
  desc,
  eq,
  like,
  lt,
  max,
  or,
  sql,
} from "drizzle-orm";

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
  fandom?: string;
};

export const worksWithHighestChapter = (filter?: WorkFilter) => {
  const tFandom = aliasedTable(tTags, "fandom");

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
      fandoms: sql<string>`GROUP_CONCAT(${tFandom.tag}, ', ')`.as("fandoms"),
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

  const conditions = [];
  if (filter) {
    if (filter.completedOnly) {
      conditions.push(eq(tChapters.chapterNumber, tWorks.chapters));
    }
    if (filter.inProgressOnly) {
      conditions.push(lt(tChapters.chapterNumber, tWorks.chapters));
    }
    if (filter.fandom) {
      conditions.push(
        and(eq(tTags.tag, filter.fandom), eq(tTags.typeId, tagTypes.fandom)),
      );
    }
    if (filter.searchQuery && filter.searchQuery.trim() !== "") {
      const searchTerm = `%${filter.searchQuery.trim()}%`;
      conditions.push(
        or(like(tWorks.title, searchTerm), like(tWorks.author, searchTerm)),
      );
    }
  }

  return query
    .leftJoin(
      tFandom,
      and(eq(tFandom.workId, tWorks.id), eq(tFandom.typeId, tagTypes.fandom)),
    )
    .leftJoin(tTags, and(eq(tTags.workId, tWorks.id)))
    .where(conditions.length > 0 ? and(...[...conditions]) : undefined)
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

export const getAllFandoms = db
  .select({
    tag: tTags.tag,
  })
  .from(tTags)
  .where(eq(tTags.typeId, tagTypes.fandom))
  .groupBy(tTags.tag)
  .orderBy(tTags.tag);
