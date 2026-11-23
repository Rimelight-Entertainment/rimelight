import { getCmsDb } from "../db/index";
import { createCms, type Cms } from "../services/index";
import { createCmsContext } from "../services/context";
import type { CmsConfig } from "../types";

export interface CmsServerOptions {
  /** Drizzle instance / D1 binding. Defaults to `c.env.DB` or `DATABASE_URL`/Hyperdrive. */
  db?: any;
  config?: CmsConfig;
  previewSecret?: string;
}

/** Builds the per-request CMS instance. */
export function cmsForRequest(c: any, options: CmsServerOptions): Cms {
  const { db, dialect } = getCmsDb({ db: options.db }, c);
  const config = options.config ?? {};
  return createCms(
    createCmsContext({
      db,
      dialect,
      blocks: config.blocks ?? [],
      locales: config.locales ?? ["en"],
      previewSecret: options.previewSecret ?? c.env?.CMS_PREVIEW_SECRET,
    }),
  );
}
