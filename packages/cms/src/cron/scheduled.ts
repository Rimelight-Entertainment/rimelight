import { and, isNotNull, isNull, lt, lte } from "drizzle-orm";
import { pageDraftLocks } from "../schema/page_draft_locks";
import { pages } from "../schema/pages";

export interface CmsCronResult {
  expiredLocksCleaned: number;
  scheduledPagesActive: number;
  timestamp: string;
}

/**
 * Handles the periodic Cloudflare Worker cron trigger (e.g. "* * * * *").
 *
 * - Cleans up expired page draft locks
 * - Checks for active scheduled pages
 */
export async function handleCmsCron(
  _event: any,
  _env: any,
  _ctx: any,
  db: any,
): Promise<CmsCronResult> {
  const result: CmsCronResult = {
    expiredLocksCleaned: 0,
    scheduledPagesActive: 0,
    timestamp: new Date().toISOString(),
  };

  if (!db) return result;

  try {
    const now = new Date();

    // 1. Purge expired draft edit locks
    const deletedLocks = await db
      .delete(pageDraftLocks)
      .where(lt(pageDraftLocks.expiresAt, now))
      .returning({ pageId: pageDraftLocks.pageId });

    result.expiredLocksCleaned = deletedLocks.length;

    // 2. Query active published pages in current window
    const activeScheduled = await db
      .select({ id: pages.id, slug: pages.slug })
      .from(pages)
      .where(
        and(isNull(pages.deletedAt), isNotNull(pages.publishedVersionId), lte(pages.postedAt, now)),
      )
      .limit(10);

    result.scheduledPagesActive = activeScheduled.length;
  } catch (error) {
    console.error("[CmsCron] Error executing scheduled tasks:", error);
  }

  return result;
}
