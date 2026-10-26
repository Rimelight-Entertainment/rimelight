import { lt } from "drizzle-orm";
import { getCmsDb } from "../db/index";
import { createCms } from "../services/index";
import type { CmsConfig } from "../types";

export interface CmsCronResult {
  published: string[];
  failed: { id: string; error: string }[];
  expiredLocksCleaned: number;
  timestamp: string;
}

/**
 * Cloudflare `scheduled` handler (or any interval job). Publishes due scheduled entries and
 * clears expired edit locks. Run it every minute or so.
 *
 * @example
 *   export default { fetch: app.fetch, scheduled: (e, env, ctx) => ctx.waitUntil(handleCmsCron({ db: env.DB })) };
 */
export async function handleCmsCron(input: {
  db: any;
  config?: CmsConfig;
  now?: Date;
}): Promise<CmsCronResult> {
  const now = input.now ?? new Date();
  const { db, dialect } = getCmsDb({ db: input.db });
  const cms = createCms({
    db,
    dialect,
    blocks: input.config?.blocks ?? [],
    locales: input.config?.locales ?? ["en"],
  });
  const { published, failed } = await cms.entries.publishDueEntries(now);
  const locks = cms.ctx.t.pageDraftLocks;
  const cleaned = await cms.ctx.db
    .delete(locks)
    .where(lt(locks.expiresAt, now))
    .returning({ pageId: locks.pageId });
  return { published, failed, expiredLocksCleaned: cleaned.length, timestamp: now.toISOString() };
}
