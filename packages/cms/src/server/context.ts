import { auth as defaultAuth, type AccessIdentity } from "@rimelight/auth";
import type { CmsAccessConfig } from "../auth/access";
import { provisionCmsUser } from "../auth/provision";
import { getCmsDb } from "../db/index";
import { createCms, type Cms } from "../services/index";
import { createCmsContext, CmsError, serviceUnavailable, type CmsActor } from "../services/context";
import type { CmsConfig } from "../types";

export interface CmsServerOptions {
  /** Drizzle instance / D1 binding. Defaults to `c.env.DB` or `DATABASE_URL`/Hyperdrive. */
  db?: any;
  config?: CmsConfig;
  /** Resolves the verified identity behind a request. Defaults to `@rimelight/auth`'s `identify`. */
  identify?: (req: Request) => Promise<AccessIdentity | null>;
  /** How verified identities map onto CMS accounts: provisioning and role mapping. */
  access?: CmsAccessConfig;
  /** Treat unauthenticated requests as an admin. Only honoured when `import.meta.env.DEV`. */
  devBypassAuth?: boolean;
  previewSecret?: string;
  /** Public API mount path (e.g. `/api/cms`), used to build same-origin media file URLs. */
  apiPath?: string;
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
      blocks: config.blocks ?? [],
      locales: config.locales ?? ["en"],
      previewSecret: options.previewSecret ?? c.env?.CMS_PREVIEW_SECRET,
    }),
  );
}

/**
 * Verified identity for a request, or `null`. Identity-service failures become 503, never anonymous.
 */
export async function resolveIdentity(
  req: Request,
  options: CmsServerOptions,
): Promise<AccessIdentity | null> {
  const identify =
    options.identify ?? ((r: Request) => defaultAuth.identify?.(r) ?? Promise.resolve(null));
  try {
    return await identify(req);
  } catch (err) {
    console.error("[@rimelight/cms] identity lookup failed", err);
    throw serviceUnavailable();
  }
}

export async function resolveActor(c: any, options: CmsServerOptions): Promise<CmsActor | null> {
  const fromContext = toActor(c.get?.("user") ?? c.get?.("session"));
  if (fromContext) return fromContext;
  const identity = await resolveIdentity(c.req.raw, options);
  if (identity) {
    if (!identity.emailVerified) return null;
    const { db, dialect } = getCmsDb({ db: options.db }, c);
    const user = await provisionCmsUser(db, dialect, identity, options.access);
    return { userId: user.id, name: user.name, roles: [user.role], permissions: [] };
  }
  if (options.devBypassAuth && isDev()) return DEV_ACTOR;
  return null;
}

export async function requireActor(c: any, options: CmsServerOptions): Promise<CmsActor> {
  const actor = await resolveActor(c, options);
  if (!actor) throw new CmsError(401, "Unauthorized");
  return actor;
}
