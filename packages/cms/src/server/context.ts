import { auth as defaultAuth } from "@rimelight/auth";
import { getCmsDb } from "../db/index";
import { createCms, type Cms } from "../services/index";
import { createCmsContext, CmsError, type CmsActor } from "../services/context";
import type { CmsConfig } from "../types";

export interface CmsServerOptions {
  /** Drizzle instance / D1 binding. Defaults to `c.env.DB` or `DATABASE_URL`/Hyperdrive. */
  db?: any;
  config?: CmsConfig;
  /** Custom session resolver. Defaults to `@rimelight/auth`. */
  getSession?: (req: Request, c: any) => Promise<any>;
  /** Treat unauthenticated requests as an admin. Only honoured when `import.meta.env.DEV`. */
  devBypassAuth?: boolean;
  previewSecret?: string;
}

const isDev = () =>
  Boolean((import.meta as any).env?.DEV) ||
  (typeof process !== "undefined" && process.env?.["NODE_ENV"] === "development");

const DEV_ACTOR: CmsActor = {
  userId: "dev-admin",
  name: "Admin (dev)",
  roles: ["owner", "admin", "editor"],
  permissions: ["*"],
};

export function toActor(session: any): CmsActor | null {
  const user = session?.user ?? session;
  const userId = user?.userId ?? user?.id;
  if (!userId) return null;
  const roles: string[] = user.roles ?? (user.role ? [user.role] : []);
  return {
    userId: String(userId),
    name: user.name ?? user.email ?? String(userId),
    roles: roles.length ? roles : ["member"],
    permissions: user.permissions ?? [],
  };
}

/** Builds the per-request CMS instance and actor resolver. */
export function cmsForRequest(c: any, options: CmsServerOptions): Cms {
  const { db, dialect } = getCmsDb({ db: options.db }, c);
  const config = options.config ?? {};
  return createCms(
    createCmsContext({
      db,
      dialect,
      collections: config.collections ?? [],
      blocks: config.blocks ?? [],
      taxonomies: config.taxonomies ?? [],
      locales: config.locales ?? ["en"],
      previewSecret: options.previewSecret ?? c.env?.CMS_PREVIEW_SECRET,
    }),
  );
}

export async function resolveActor(c: any, options: CmsServerOptions): Promise<CmsActor | null> {
  const fromContext = toActor(c.get?.("user") ?? c.get?.("session"));
  if (fromContext) return fromContext;
  const session = options.getSession
    ? await options.getSession(c.req.raw, c)
    : await defaultAuth.getSession(c.req.raw).catch(() => null);
  const actor = toActor(session);
  if (actor) return actor;
  if (options.devBypassAuth && isDev()) return DEV_ACTOR;
  return null;
}

export async function requireActor(c: any, options: CmsServerOptions): Promise<CmsActor> {
  const actor = await resolveActor(c, options);
  if (!actor) throw new CmsError(401, "Unauthorized");
  return actor;
}
