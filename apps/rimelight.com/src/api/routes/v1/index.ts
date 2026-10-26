import { Hono } from "hono";
import { and, eq, sql } from "drizzle-orm";
import { getDb } from "#db";
import { titleSettings } from "#db/schema/title-settings";
import { isTitleSlug } from "../../titles";
import { allowRequest } from "../../rate-limit";
import { requireClientToken, type ClientVariables } from "./middleware";
import {
  byteLength,
  mergeTitleSettings,
  MAX_BODY_BYTES,
  MAX_STORED_BYTES,
  titleSettingsPatchSchema,
} from "./title-settings";

class PayloadTooLargeError extends Error {}

/**
 * Rimelight client API, version 1. Account-level routes are shared by every title. Settings are
 * per title: `/titles/:title/settings`.
 */
const v1 = new Hono<{ Bindings: Env; Variables: ClientVariables }>();

v1.use("*", requireClientToken);

v1.get("/profile", (c) => {
  const user = c.var.user;
  return c.json({
    id: user.id,
    email: user.email,
    name: user.name,
    tag: user.tag,
    created_at: user.createdAt,
  });
});

v1.use("/titles/:title/*", async (c, next) => {
  if (!isTitleSlug(c.req.param("title"))) {
    return c.json({ error: "Not Found", message: "Unknown title." }, 404);
  }
  return next();
});

v1.get("/titles/:title/settings", async (c) => {
  const db = getDb();
  const [row] = await db
    .select()
    .from(titleSettings)
    .where(
      and(eq(titleSettings.userId, c.var.user.id), eq(titleSettings.title, c.req.param("title"))),
    )
    .limit(1);
  return c.json({ success: true, version: row?.version ?? 0, settings: row?.settings ?? {} });
});

v1.put("/titles/:title/settings", async (c) => {
  const title = c.req.param("title");
  if (!(await allowRequest(c.env?.RATE_LIMIT, `settings:${c.var.user.id}`))) {
    return c.json({ error: "Too Many Requests", message: "Too many settings writes." }, 429, {
      "Retry-After": "60",
    });
  }
  const raw = await c.req.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    return c.json({ error: "Payload Too Large", message: "Body exceeds 16 KB." }, 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return c.json({ error: "Bad Request", message: "Body must be JSON." }, 400);
  }

  const parsed = titleSettingsPatchSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Bad Request", message: "Settings structure is invalid." }, 400);
  }

  const db = getDb();
  const userId = c.var.user.id;
  const key = and(eq(titleSettings.userId, userId), eq(titleSettings.title, title));

  try {
    const updated = await db.transaction(async (tx) => {
      // Create the row first. FOR UPDATE locks nothing when no row exists yet.
      await tx.insert(titleSettings).values({ userId, title }).onConflictDoNothing();
      const [row] = await tx.select().from(titleSettings).where(key).for("update");

      const merged = mergeTitleSettings(row!.settings, parsed.data);
      if (byteLength(merged) > MAX_STORED_BYTES) throw new PayloadTooLargeError();

      const [result] = await tx
        .update(titleSettings)
        .set({
          settings: merged,
          version: sql`${titleSettings.version} + 1`,
          updatedAt: new Date(),
        })
        .where(key)
        .returning();
      return result!;
    });

    return c.json({ success: true, version: updated.version, settings: updated.settings });
  } catch (err) {
    if (err instanceof PayloadTooLargeError) {
      return c.json(
        { error: "Payload Too Large", message: "Stored settings would exceed 64 KB." },
        413,
      );
    }
    throw err;
  }
});

export default v1;
