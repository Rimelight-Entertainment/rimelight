import { lt } from "drizzle-orm";
import { getCmsDb } from "../db/index";
import { createCms, type Cms } from "../services/index";
import type { CmsConfig } from "../types";

export interface CmsCronResult {
  /** Jobs that ran in this invocation. */
  ran: string[];
  published: string[];
  failed: { id: string; error: string }[];
  expiredLocksCleaned: number;
  searchReindexed: boolean;
  timestamp: string;
}

export type CmsJobName = "publish-scheduled" | "clear-expired-locks" | "reindex-search";

interface CmsJob {
  /** Cloudflare cron expression that triggers this job. */
  cron: string;
  run: (cms: Cms, now: Date, out: CmsCronResult) => Promise<void>;
}

/**
 * The CMS's background jobs, one cron each. Every job is a Cloudflare trigger, and triggers count
 * against the plan's limit (free accounts get 5), so keep this list short. A job only runs when its
 * trigger is declared in the app's Cloudflare config; undeclared jobs never fire.
 */
export const CMS_JOBS: Record<CmsJobName, CmsJob> = {
  /** Publishes entries whose scheduled time has passed. */
  "publish-scheduled": {
    cron: "* * * * *",
    run: async (cms, now, out) => {
      const { published, failed } = await cms.entries.publishDueEntries(now);
      out.published.push(...published);
      out.failed.push(...failed);
    },
  },
  /** Clears edit locks that expired (a user closed the tab or lost connection). */
  "clear-expired-locks": {
    cron: "*/15 * * * *",
    run: async (cms, now, out) => {
      const locks = cms.ctx.t.pageDraftLocks;
      const cleaned = await cms.ctx.db
        .delete(locks)
        .where(lt(locks.expiresAt, now))
        .returning({ pageId: locks.pageId });
      out.expiredLocksCleaned += cleaned.length;
    },
  },
  /** Rebuilds the search index from published content, once a day. */
  "reindex-search": {
    cron: "0 3 * * *",
    run: async (cms, _now, out) => {
      await cms.search.reindexAll();
      out.searchReindexed = true;
    },
  },
};

/**
 * Cron expressions to declare in the app's Cloudflare config (`triggers.crons`). Declare only the
 * ones you want; leaving the list out turns the jobs off and keeps them out of the plan's limit.
 *
 * @example
 *   triggers: { crons: CMS_CRONS }
 */
export const CMS_CRONS: string[] = [...new Set(Object.values(CMS_JOBS).map((j) => j.cron))];

/**
 * Cloudflare `scheduled` handler. Runs the job(s) whose cron matches `input.cron`; with no cron given
 * (for example from a manual call), runs every job.
 *
 * @example
 *   export default { fetch: app.fetch, scheduled: (e, env, ctx) => ctx.waitUntil(handleCmsCron({ db: env.DB, cron: e.cron })) };
 */
export async function handleCmsCron(input: {
  db: any;
  config?: CmsConfig;
  /** The cron expression that fired (`event.cron`). */
  cron?: string;
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
  const out: CmsCronResult = {
    ran: [],
    published: [],
    failed: [],
    expiredLocksCleaned: 0,
    searchReindexed: false,
    timestamp: now.toISOString(),
  };
  for (const [name, job] of Object.entries(CMS_JOBS) as [CmsJobName, CmsJob][]) {
    if (input.cron !== undefined && job.cron !== input.cron) continue;
    await job.run(cms, now, out);
    out.ran.push(name);
  }
  return out;
}
