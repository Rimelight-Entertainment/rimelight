import { Hono } from "hono";
import { auth as defaultAuth } from "@rimelight/auth";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { createContentRouter } from "./content";
import { createSearchRouter } from "./search";
import {
  pages as defaultPages,
  pageDrafts as defaultPageDrafts,
  pageDraftLocks as defaultPageDraftLocks,
  pageTemplates as defaultPageTemplates,
  pageVersions as defaultPageVersions,
  pageVersionApprovals as defaultPageVersionApprovals,
  contentTypes as defaultContentTypes,
} from "../schema";
import { eq, and, desc, isNull } from "drizzle-orm";
import {
  validateServerBlockPayload,
  getSiteSettings,
  updateSiteSettings,
  handleCmsMcpRequest,
  generatePreviewToken,
  diffPageSnapshots,
  indexPageForSearch,
  getTaxonomyTerms,
  getTerm,
  getEntryTerms,
  assignEntryTerms,
  createTerm,
  updateTerm,
  deleteTerm,
  getBylines,
  getByline,
  createByline,
  updateByline,
  deleteByline,
} from "../index";

export interface CmsRouterOptions {
  prefix?: string | undefined;
  db?: any;
  auth?: { getSession: (req: Request) => Promise<any> } | undefined;
  schema?:
    | {
        pages?: any;
        pageDrafts?: any;
        pageDraftLocks?: any;
        pageTemplates?: any;
        pageVersions?: any;
        pageVersionApprovals?: any;
        contentTypes?: any;
        searchIndex?: any;
      }
    | undefined;
  includeContent?: boolean | undefined;
  includeSearch?: boolean | undefined;
}

export function createCmsRouter(options: CmsRouterOptions = {}) {
  const router = new Hono();

  router.onError((err: any, c: any) => {
    console.error("[@rimelight/cms Router Error]:", err);
    return c.json({ error: err?.message || "Internal CMS Error" }, 500);
  });

  if (options.includeContent !== false) {
    const content = createContentRouter({
      db: options.db,
      ...(options.schema ? { schema: { pages: options.schema.pages } } : {}),
    });
    router.route("/content", content);
  }

  if (options.includeSearch !== false) {
    const search = createSearchRouter({
      db: options.db,
      ...(options.schema ? { schema: { searchIndex: options.schema.searchIndex } } : {}),
    });
    router.route("/search", search);
  }

  const cms = new Hono();

  cms.onError((err: any, c: any) => {
    console.error("[@rimelight/cms Core Router Error]:", err);
    return c.json({ error: err?.message || "Internal CMS Error" }, 500);
  });

  // Database resolution (from Worker env bindings, explicit option, virtual:rimelight-cms, or global)
  let resolvedDb: any = null;
  const getDb = async (c?: any) => {
    if (resolvedDb) return resolvedDb;
    if (c?.env?.DB) {
      resolvedDb = c.env.DB;
      return resolvedDb;
    }
    const envUrl =
      c?.env?.HYPERDRIVE?.connectionString ||
      c?.env?.HYPERDRIVE_URL ||
      c?.env?.DATABASE_URL ||
      (typeof process !== "undefined"
        ? process.env?.["HYPERDRIVE_URL"] || process.env?.["DATABASE_URL"]
        : undefined) ||
      (typeof import.meta !== "undefined"
        ? (import.meta as any).env?.["HYPERDRIVE_URL"] || (import.meta as any).env?.["DATABASE_URL"]
        : undefined);
    if (typeof envUrl === "string" && envUrl.trim().length > 0) {
      resolvedDb = drizzle({ client: neon(envUrl.trim()) });
      return resolvedDb;
    }
    if (options.db) {
      resolvedDb = options.db;
      return resolvedDb;
    }
    if (typeof (globalThis as any).__rimelight_db !== "undefined") {
      resolvedDb = (globalThis as any).__rimelight_db;
      return resolvedDb;
    }
    throw new Error(
      "[@rimelight/cms] No database instance found. Please configure `DATABASE_URL` or `#db` export or pass `db` to `cms({ db })`.",
    );
  };

  const auth = options.auth || defaultAuth;
  const getSession = async (c: any) => {
    const existingUser = c?.get?.("user") || c?.get?.("session");
    if (existingUser && existingUser.userId) return existingUser;
    const session = await auth.getSession(c.req.raw);
    if (session) return session;

    let isLocalHost = false;
    try {
      const host = new URL(c.req.url).hostname;
      isLocalHost =
        host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]";
    } catch {}

    const isDev =
      isLocalHost ||
      (typeof process !== "undefined" && process.env?.["NODE_ENV"] === "development") ||
      (typeof import.meta !== "undefined" && Boolean((import.meta as any).env?.DEV));

    if (isDev) {
      return {
        userId: "dev-admin-user",
        email: "admin@rimelight.com",
        name: "Admin (Dev)",
        roles: ["owner", "admin", "editor"],
        permissions: ["*"],
        userType: "employee",
      };
    }
    return null;
  };
  const pages = options.schema?.pages || defaultPages;
  const pageDrafts = options.schema?.pageDrafts || defaultPageDrafts;
  const pageDraftLocks = options.schema?.pageDraftLocks || defaultPageDraftLocks;
  const pageTemplates = options.schema?.pageTemplates || defaultPageTemplates;
  const pageVersions = options.schema?.pageVersions || defaultPageVersions;
  const pageVersionApprovals = options.schema?.pageVersionApprovals || defaultPageVersionApprovals;
  const contentTypes = options.schema?.contentTypes || defaultContentTypes;

  async function checkApprovalRequirements(
    db: any,
    pageId: string,
    userId: string,
    userRoles: string[],
  ) {
    const page = await db.select().from(pages).where(eq(pages.id, pageId)).limit(1);
    if (!page[0] || !page[0].templateId) {
      return { canPublish: true, reason: null };
    }

    const template = await db
      .select()
      .from(pageTemplates)
      .where(eq(pageTemplates.id, page[0].templateId))
      .limit(1);
    if (!template[0]) {
      return { canPublish: true, reason: null };
    }

    const approvalRules = template[0].approvalRules || {
      allowSelfApproval: true,
      minApprovals: 1,
    };
    const minApprovals = approvalRules.minApprovals ?? 1;

    const lastVersion = await db
      .select()
      .from(pageVersions)
      .where(eq(pageVersions.pageId, pageId))
      .orderBy(desc(pageVersions.versionNumber))
      .limit(1);

    let existingApprovals: any[] = [];
    if (lastVersion[0]) {
      existingApprovals = await db
        .select()
        .from(pageVersionApprovals)
        .where(eq(pageVersionApprovals.versionId, lastVersion[0].id))
        .limit(10);
    }

    const requiredRoles = template[0].rolePermissions?.whoCanReview?.length
      ? template[0].rolePermissions.whoCanReview
      : approvalRules.requiredRolesForApproval;

    const isOwnerOrAdmin = userRoles.some((role) =>
      ["owner", "admin"].includes(role.toLowerCase()),
    );

    if (isOwnerOrAdmin) {
      return { canPublish: true, reason: null };
    }

    if (requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = userRoles.some((role) => requiredRoles.includes(role));
      if (!hasRequiredRole) {
        return { canPublish: false, reason: "User does not have required role for approval" };
      }
    }

    const userAlreadyApproved = existingApprovals.some((a) => a.userId === userId);
    if (!approvalRules.allowSelfApproval && userAlreadyApproved) {
      const otherApprovals = existingApprovals.filter((a) => a.userId !== userId);
      if (otherApprovals.length < minApprovals) {
        return {
          canPublish: false,
          reason: `Self-approval not allowed. Need ${minApprovals} distinct approvers.`,
        };
      }
    }

    const effectiveApprovals = approvalRules.allowSelfApproval
      ? existingApprovals.length
      : existingApprovals.filter((a) => a.userId !== userId).length;

    if (effectiveApprovals < minApprovals) {
      return {
        canPublish: false,
        reason: `Need ${minApprovals} approvals, currently have ${effectiveApprovals}`,
      };
    }

    return { canPublish: true, reason: null };
  }

  // Templates
  cms.get("/templates", async (c) => {
    const db = await getDb(c);
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const templates = await db.select().from(pageTemplates).orderBy(desc(pageTemplates.createdAt));
    return c.json({ templates });
  });

  cms.post("/templates", async (c) => {
    const db = await getDb(c);
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const body: any = await c.req.json();
    const rolePermissions = body.rolePermissions || {
      whoCanCreate: body.allowedRoles || [],
      whoCanEdit: [],
      whoCanReview: [],
      whoCanView: [],
    };
    const allowedRoles = rolePermissions.whoCanCreate || body.allowedRoles || [];

    const template = await db
      .insert(pageTemplates)
      .values({
        ...body,
        allowedRoles,
        rolePermissions,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return c.json({ template: template[0] });
  });

  cms.put("/templates/:id", async (c) => {
    const db = await getDb(c);
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const id = c.req.param("id");
    const body: any = await c.req.json();

    const updateData = { ...body, updatedAt: new Date() };
    if (body.rolePermissions?.whoCanCreate) {
      updateData.allowedRoles = body.rolePermissions.whoCanCreate;
    }

    const template = await db
      .update(pageTemplates)
      .set(updateData)
      .where(eq(pageTemplates.id, id))
      .returning();

    return c.json({ template: template[0] });
  });

  cms.delete("/templates/:id", async (c) => {
    const db = await getDb(c);
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const id = c.req.param("id");
    await db.delete(pageTemplates).where(eq(pageTemplates.id, id));

    return c.json({ success: true });
  });

  // Versions
  cms.get("/versions", async (c) => {
    const db = await getDb(c);
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const versionsList = await db
      .select()
      .from(pageVersions)
      .orderBy(desc(pageVersions.createdAt))
      .limit(50);

    const versionsWithPage = await Promise.all(
      versionsList.map(async (version: any) => {
        const page = await db
          .select({ title: pages.title, slug: pages.slug })
          .from(pages)
          .where(eq(pages.id, version.pageId))
          .limit(1);
        return Object.assign({}, version, {
          pageTitle: page[0]?.title || "Unknown Page",
          slug: page[0]?.slug || "",
        });
      }),
    );

    return c.json({ versions: versionsWithPage });
  });

  // Pages
  cms.get("/pages", async (c) => {
    const db = await getDb(c);
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const pagesList = await db
      .select()
      .from(pages)
      .where(isNull(pages.deletedAt))
      .orderBy(desc(pages.createdAt));

    const pagesData = pagesList.map((page: any) =>
      Object.assign({}, page, {
        content: typeof page.content === "string" ? JSON.parse(page.content) : page.content,
      }),
    );

    return c.json({ pages: pagesData });
  });

  cms.get("/pages/:id", async (c) => {
    const db = await getDb(c);
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const id = c.req.param("id");
    const page = await db.select().from(pages).where(eq(pages.id, id)).limit(1);

    if (!page[0]) return c.json({ error: "Page not found" }, 404);

    const draft = await db.select().from(pageDrafts).where(eq(pageDrafts.pageId, id)).limit(1);

    const pageData = {
      ...page[0],
      content: typeof page[0].content === "string" ? JSON.parse(page[0].content) : page[0].content,
    };

    const draftData = draft[0]
      ? {
          ...draft[0],
          content:
            typeof draft[0].content === "string" ? JSON.parse(draft[0].content) : draft[0].content,
        }
      : null;

    return c.json({ page: pageData, draft: draftData });
  });

  cms.post("/pages", async (c) => {
    const db = await getDb(c);
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const body: any = await c.req.json();

    const templateId =
      body.templateId && body.templateId !== "null" && String(body.templateId).trim() !== ""
        ? String(body.templateId).trim()
        : null;

    const title =
      typeof body.title === "string" ? { en: body.title } : body.title || { en: "Untitled Page" };
    const description =
      typeof body.description === "string" ? { en: body.description } : body.description || null;

    let initialBlocks = body.content?.blocks;
    let templateVersion = body.templateVersion || 1;

    if (templateId) {
      const tmpl = await db
        .select()
        .from(pageTemplates)
        .where(eq(pageTemplates.id, templateId))
        .limit(1);
      if (tmpl[0]) {
        templateVersion = tmpl[0].version;
        if (!initialBlocks || initialBlocks.length === 0) {
          initialBlocks = tmpl[0].initialBlocks || [];
        }
      }
    }

    if (!initialBlocks || initialBlocks.length === 0) {
      initialBlocks = [
        {
          id: crypto.randomUUID(),
          type: "ParagraphBlock",
          props: { text: { en: "Start writing your content..." } },
        },
      ];
    }

    const pageContent = {
      blocks: initialBlocks,
      properties: body.content?.properties || {},
    };

    const page = await db
      .insert(pages)
      .values({
        slug: body.slug,
        type: body.type || "blog",
        title,
        description,
        templateId,
        templateVersion,
        content: pageContent,
        authorIds: [session.userId],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!page[0]) return c.json({ error: "Failed to create page" }, 500);

    await db.insert(pageDrafts).values({
      pageId: page[0].id,
      content: pageContent,
      updatedBy: session.userId,
      updatedAt: new Date(),
    });

    return c.json({ page: page[0] });
  });

  cms.put("/pages/:id", async (c) => {
    const db = await getDb(c);
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const id = c.req.param("id");
    const body: any = await c.req.json();

    const existingPage = await db.select().from(pages).where(eq(pages.id, id)).limit(1);
    if (!existingPage[0]) return c.json({ error: "Page not found" }, 404);

    const incomingContent =
      typeof body.content === "string" ? JSON.parse(body.content) : body.content;
    if (incomingContent?.blocks) {
      const existingContent =
        typeof existingPage[0].content === "string"
          ? JSON.parse(existingPage[0].content)
          : existingPage[0].content;

      const userSession = {
        userId: session.userId,
        roles: session.roles || ["member"],
        permissions: [],
      };

      const validation = validateServerBlockPayload(
        existingContent.blocks || [],
        incomingContent.blocks || [],
        userSession,
      );
      if (!validation.valid) {
        return c.json({ error: validation.reason }, 403);
      }
    }

    const page = await db
      .update(pages)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(pages.id, id))
      .returning();

    return c.json({ page: page[0] });
  });

  cms.delete("/pages/:id", async (c) => {
    const db = await getDb(c);
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const id = c.req.param("id");
    await db.update(pages).set({ deletedAt: new Date() }).where(eq(pages.id, id));

    return c.json({ success: true });
  });

  // Drafts
  cms.post("/pages/:id/draft", async (c) => {
    const db = await getDb(c);
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const id = c.req.param("id");
    const body: any = await c.req.json();

    const existingPage = await db.select().from(pages).where(eq(pages.id, id)).limit(1);
    if (!existingPage[0]) return c.json({ error: "Page not found" }, 404);

    const existingDraft = await db
      .select()
      .from(pageDrafts)
      .where(eq(pageDrafts.pageId, id))
      .limit(1);

    const incomingContent =
      typeof body.content === "string" ? JSON.parse(body.content) : body.content;
    if (incomingContent?.blocks) {
      const baseContent = existingDraft[0]?.content || existingPage[0].content;
      const existingContent =
        typeof baseContent === "string" ? JSON.parse(baseContent) : baseContent;

      const userSession = {
        userId: session.userId,
        roles: session.roles || ["member"],
        permissions: [],
      };

      const validation = validateServerBlockPayload(
        existingContent?.blocks || [],
        incomingContent.blocks || [],
        userSession,
      );
      if (!validation.valid) {
        return c.json({ error: validation.reason, message: validation.reason }, 403);
      }
    }

    let draftPayload: any = incomingContent;
    if (draftPayload && draftPayload.content) {
      draftPayload = draftPayload.content;
    }
    if (Array.isArray(draftPayload)) {
      draftPayload = { blocks: draftPayload, properties: {} };
    }
    if (!draftPayload || !Array.isArray(draftPayload.blocks)) {
      draftPayload = {
        blocks: incomingContent?.blocks || [],
        properties: incomingContent?.properties || {},
      };
    }

    await db
      .insert(pageDrafts)
      .values({
        pageId: id,
        content: draftPayload,
        updatedBy: session.userId,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: pageDrafts.pageId,
        set: {
          content: draftPayload,
          updatedBy: session.userId,
          updatedAt: new Date(),
        },
      });

    return c.json({ success: true });
  });

  // Draft Locks
  cms.post("/pages/:id/lock/checkout", async (c) => {
    const db = await getDb(c);
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const id = c.req.param("id");

    const existingLock = await db
      .select()
      .from(pageDraftLocks)
      .where(eq(pageDraftLocks.pageId, id))
      .limit(1);

    if (existingLock[0]) {
      const isExpired = new Date(existingLock[0].expiresAt) < new Date();
      if (!isExpired) {
        return c.json({
          success: false,
          lockedByUserId: existingLock[0].lockedByUserId,
          lockedByUserName: existingLock[0].lockedByUserName,
          expiresAt: existingLock[0].expiresAt,
        });
      }
    }

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db
      .insert(pageDraftLocks)
      .values({
        pageId: id,
        lockedByUserId: session.userId,
        lockedByUserName: session.name || "User",
        acquiredAt: new Date(),
        expiresAt,
      })
      .onConflictDoUpdate({
        target: pageDraftLocks.pageId,
        set: {
          lockedByUserId: session.userId,
          lockedByUserName: session.name || "User",
          acquiredAt: new Date(),
          expiresAt,
        },
      });

    return c.json({ success: true });
  });

  cms.post("/pages/:id/lock/heartbeat", async (c) => {
    const db = await getDb(c);
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const id = c.req.param("id");

    const existingLock = await db
      .select()
      .from(pageDraftLocks)
      .where(eq(pageDraftLocks.pageId, id))
      .limit(1);

    if (existingLock[0] && existingLock[0].lockedByUserId !== session.userId) {
      const isExpired = new Date(existingLock[0].expiresAt) < new Date();
      if (!isExpired) {
        return c.json({ error: "Forbidden: Lock held by another user" }, 403);
      }
    }

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db
      .update(pageDraftLocks)
      .set({
        lockedByUserId: session.userId,
        lockedByUserName: session.name || "User",
        expiresAt,
      })
      .where(eq(pageDraftLocks.pageId, id));

    return c.json({ success: true });
  });

  cms.post("/pages/:id/lock/release", async (c) => {
    const db = await getDb(c);
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const id = c.req.param("id");
    await db
      .delete(pageDraftLocks)
      .where(and(eq(pageDraftLocks.pageId, id), eq(pageDraftLocks.lockedByUserId, session.userId)));

    return c.json({ success: true });
  });

  // Publish
  cms.post("/pages/:id/publish", async (c) => {
    const db = await getDb(c);
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const id = c.req.param("id");
    const body: any = await c.req.json();

    const page = await db.select().from(pages).where(eq(pages.id, id)).limit(1);
    if (!page[0]) return c.json({ error: "Page not found" }, 404);

    const userRoles = session.roles || ["member"];
    const approvalCheck = await checkApprovalRequirements(db, id, session.userId, userRoles);
    if (!approvalCheck.canPublish) {
      return c.json({ error: approvalCheck.reason }, 403);
    }

    const lastVersion = await db
      .select()
      .from(pageVersions)
      .where(eq(pageVersions.pageId, id))
      .orderBy(desc(pageVersions.versionNumber))
      .limit(1);

    const nextVersionNumber = (lastVersion[0]?.versionNumber || 0) + 1;

    const version = await db
      .insert(pageVersions)
      .values({
        pageId: id,
        versionNumber: nextVersionNumber,
        status: "published",
        slug: page[0].slug,
        type: page[0].type,
        title: page[0].title,
        description: page[0].description,
        tags: page[0].tags,
        authorIds: page[0].authorIds,
        content: body.content,
        createdBy: session.userId,
        approvedBy: [session.userId],
        approvedAt: new Date(),
        changeSummary: body.changeSummary,
        createdAt: new Date(),
      })
      .returning();

    if (!version[0]) return c.json({ error: "Failed to create version" }, 500);

    await db.insert(pageVersionApprovals).values({
      versionId: version[0].id,
      userId: session.userId,
      userRole: session.roles?.[0] || "member",
      approvedAt: new Date(),
    });

    await db
      .update(pages)
      .set({
        content: body.content,
        publishedVersionId: version[0].id,
        postedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(pages.id, id));

    await indexPageForSearch(db, { id, title: page[0].title, content: body.content }, ["en", "pt"]);

    return c.json({ version: version[0] });
  });

  // Preview Token
  cms.post("/pages/:id/preview-token", async (c) => {
    const db = await getDb(c);
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const id = c.req.param("id");
    const page = await db.select().from(pages).where(eq(pages.id, id)).limit(1);
    if (!page[0]) return c.json({ error: "Page not found" }, 404);

    const secret = (c.env as any)?.CMS_PREVIEW_SECRET || "rimelight-preview-secret-key";
    const { token, expiresAt } = await generatePreviewToken(id, secret, 86400 * 7);

    return c.json({
      token,
      expiresAt,
      previewUrl: `/en/cms/pages/${id}/preview?token=${encodeURIComponent(token)}`,
    });
  });

  // Diff
  cms.get("/pages/:id/diff", async (c) => {
    const db = await getDb(c);
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const id = c.req.param("id");
    const fromVersionNum = c.req.query("from");
    const toVersionNum = c.req.query("to");

    const page = await db.select().from(pages).where(eq(pages.id, id)).limit(1);
    if (!page[0]) return c.json({ error: "Page not found" }, 404);

    let fromSnapshot: any = page[0];
    if (fromVersionNum) {
      const v = await db
        .select()
        .from(pageVersions)
        .where(
          and(
            eq(pageVersions.pageId, id),
            eq(pageVersions.versionNumber, parseInt(fromVersionNum, 10)),
          ),
        )
        .limit(1);
      if (v[0]) fromSnapshot = v[0];
    }

    let toSnapshot: any = null;
    if (toVersionNum) {
      const v = await db
        .select()
        .from(pageVersions)
        .where(
          and(
            eq(pageVersions.pageId, id),
            eq(pageVersions.versionNumber, parseInt(toVersionNum, 10)),
          ),
        )
        .limit(1);
      if (v[0]) toSnapshot = v[0];
    } else {
      const draft = await db.select().from(pageDrafts).where(eq(pageDrafts.pageId, id)).limit(1);
      toSnapshot = draft[0] ? { ...page[0], content: draft[0].content } : page[0];
    }

    const parseJson = (val: any) => (typeof val === "string" ? JSON.parse(val) : val);
    fromSnapshot = { ...fromSnapshot, content: parseJson(fromSnapshot.content) };
    toSnapshot = { ...toSnapshot, content: parseJson(toSnapshot.content) };

    const diffResult = diffPageSnapshots(fromSnapshot, toSnapshot);
    return c.json({ diff: diffResult });
  });

  // Version Approvals
  cms.post("/versions/:versionId/approve", async (c) => {
    const db = await getDb(c);
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const versionId = c.req.param("versionId");

    const version = await db
      .select()
      .from(pageVersions)
      .where(eq(pageVersions.id, versionId))
      .limit(1);
    if (!version[0]) return c.json({ error: "Version not found" }, 404);

    const existingApproval = await db
      .select()
      .from(pageVersionApprovals)
      .where(
        and(
          eq(pageVersionApprovals.versionId, versionId),
          eq(pageVersionApprovals.userId, session.userId),
        ),
      )
      .limit(1);

    if (existingApproval[0]) {
      return c.json({ error: "Already approved" }, 400);
    }

    await db.insert(pageVersionApprovals).values({
      versionId,
      userId: session.userId,
      userRole: session.roles?.[0] || "member",
      approvedAt: new Date(),
    });

    const allApprovals = await db
      .select()
      .from(pageVersionApprovals)
      .where(eq(pageVersionApprovals.versionId, versionId));

    await db
      .update(pageVersions)
      .set({
        approvedBy: allApprovals.map((a: any) => a.userId),
        approvedAt: new Date(),
      })
      .where(eq(pageVersions.id, versionId));

    return c.json({ success: true });
  });

  // Settings
  cms.get("/settings", async (c) => {
    const db = await getDb(c);
    const settings = await getSiteSettings(db);
    return c.json({ settings });
  });

  cms.put("/settings", async (c) => {
    const db = await getDb(c);
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    const isOwnerOrAdmin = ["owner", "admin"].includes(
      (session.roles?.[0] || "member")?.toLowerCase() || "",
    );
    if (!isOwnerOrAdmin) return c.json({ error: "Forbidden" }, 403);

    const body: any = await c.req.json();
    const updated = await updateSiteSettings(db, body);
    return c.json({ settings: updated });
  });

  // Taxonomies
  cms.get("/taxonomies/:taxonomy/terms", async (c) => {
    const db = await getDb(c);
    const taxonomy = c.req.param("taxonomy");
    const includeCounts = c.req.query("includeCounts") !== "false";
    const terms = await getTaxonomyTerms(db, taxonomy, { includeCounts });
    return c.json(terms);
  });

  cms.post("/taxonomies/:taxonomy/terms", async (c) => {
    const db = await getDb(c);
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const taxonomy = c.req.param("taxonomy");
    const body: any = await c.req.json();
    const term = await createTerm(db, { ...body, taxonomy });
    return c.json(term, 201);
  });

  cms.get("/taxonomies/:taxonomy/terms/:slug", async (c) => {
    const db = await getDb(c);
    const taxonomy = c.req.param("taxonomy");
    const slug = c.req.param("slug");
    const term = await getTerm(db, taxonomy, slug);
    if (!term) return c.json({ error: "Term not found" }, 404);
    return c.json(term);
  });

  cms.put("/taxonomies/:taxonomy/terms/:id", async (c) => {
    const db = await getDb(c);
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const id = c.req.param("id");
    const body: any = await c.req.json();
    const updated = await updateTerm(db, id, body);
    return c.json(updated);
  });

  cms.delete("/taxonomies/:taxonomy/terms/:id", async (c) => {
    const db = await getDb(c);
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const id = c.req.param("id");
    await deleteTerm(db, id);
    return c.json({ success: true });
  });

  cms.get("/pages/:id/terms", async (c) => {
    const db = await getDb(c);
    const id = c.req.param("id");
    const taxonomy = c.req.query("taxonomy");
    const terms = await getEntryTerms(db, id, taxonomy);
    return c.json({ terms });
  });

  cms.post("/pages/:id/terms/:taxonomy", async (c) => {
    const db = await getDb(c);
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const id = c.req.param("id");
    const taxonomy = c.req.param("taxonomy");
    const body: any = await c.req.json();
    const termIds = Array.isArray(body.termIds) ? body.termIds : [];

    await assignEntryTerms(db, id, taxonomy, termIds);
    return c.json({ success: true });
  });

  // Bylines
  cms.get("/bylines", async (c) => {
    const db = await getDb(c);
    const allBylines = await getBylines(db);
    return c.json(allBylines);
  });

  cms.post("/bylines", async (c) => {
    const db = await getDb(c);
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const body: any = await c.req.json();
    const byline = await createByline(db, body);
    return c.json(byline, 201);
  });

  cms.get("/bylines/:id", async (c) => {
    const db = await getDb(c);
    const id = c.req.param("id");
    const byline = await getByline(db, id);
    if (!byline) return c.json({ error: "Byline not found" }, 404);
    return c.json(byline);
  });

  cms.put("/bylines/:id", async (c) => {
    const db = await getDb(c);
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const id = c.req.param("id");
    const body: any = await c.req.json();
    const updated = await updateByline(db, id, body);
    if (!updated) return c.json({ error: "Byline not found" }, 404);
    return c.json(updated);
  });

  cms.delete("/bylines/:id", async (c) => {
    const db = await getDb(c);
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const id = c.req.param("id");
    await deleteByline(db, id);
    return c.json({ success: true });
  });

  // Content Types (Dynamic Schemas & E-Com)
  cms.get("/content-types", async (c) => {
    const db = await getDb(c);
    const rows = await db.select().from(contentTypes).orderBy(desc(contentTypes.createdAt));
    return c.json({ contentTypes: rows });
  });

  cms.get("/content-types/:slugOrId", async (c) => {
    const db = await getDb(c);
    const slugOrId = c.req.param("slugOrId");
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
    const row = await db
      .select()
      .from(contentTypes)
      .where(isUuid ? eq(contentTypes.id, slugOrId) : eq(contentTypes.slug, slugOrId))
      .limit(1);
    if (!row[0]) return c.json({ error: "Content type not found" }, 404);
    return c.json({ contentType: row[0] });
  });

  cms.post("/content-types", async (c) => {
    const db = await getDb(c);
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const body: any = await c.req.json();
    const inserted = await db
      .insert(contentTypes)
      .values({
        slug: body.slug,
        name: body.name,
        description: body.description ?? null,
        icon: body.icon ?? "i-lucide-box",
        mode: body.mode ?? "document",
        fieldSchema: body.fieldSchema ?? {},
        ecomSettings: body.ecomSettings ?? null,
        initialBlocks: body.initialBlocks ?? [],
        isSystem: body.isSystem ?? false,
      })
      .returning();
    return c.json({ contentType: inserted[0] }, 201);
  });

  cms.put("/content-types/:id", async (c) => {
    const db = await getDb(c);
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const id = c.req.param("id");
    const body: any = await c.req.json();
    const updated = await db
      .update(contentTypes)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(contentTypes.id, id))
      .returning();
    if (!updated[0]) return c.json({ error: "Content type not found" }, 404);
    return c.json({ contentType: updated[0] });
  });

  cms.delete("/content-types/:id", async (c) => {
    const db = await getDb(c);
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const id = c.req.param("id");
    await db.delete(contentTypes).where(eq(contentTypes.id, id));
    return c.json({ success: true });
  });

  // CMS Dashboard Stats
  cms.get("/stats", async (c) => {
    const db = await getDb(c);
    try {
      const [allPagesList, allBylinesList, categoriesList, tagsList] = await Promise.all([
        db.select().from(pages).where(isNull(pages.deletedAt)),
        getBylines(db),
        getTaxonomyTerms(db, "category"),
        getTaxonomyTerms(db, "tag"),
      ]);
      return c.json({
        totalPages: allPagesList.length,
        totalBylines: allBylinesList.length,
        totalCategories: categoriesList.length,
        totalTags: tagsList.length,
      });
    } catch {
      return c.json({
        totalPages: 0,
        totalBylines: 0,
        totalCategories: 0,
        totalTags: 0,
      });
    }
  });

  // MCP JSON-RPC Endpoint
  cms.post("/mcp", async (c) => {
    const db = await getDb(c);
    const body: any = await c.req.json();
    const result = await handleCmsMcpRequest(body, db);
    return c.json(result);
  });

  router.route("/cms", cms);
  if (options.prefix && options.prefix !== "/cms" && options.prefix !== "") {
    router.route(options.prefix, cms);
  }
  router.route("/", cms);

  return router;
}

export const cmsRouter: Hono = createCmsRouter();
export type CmsRouterType = ReturnType<typeof createCmsRouter>;
