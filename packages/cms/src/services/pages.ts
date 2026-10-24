import { and, desc, eq, isNull } from "drizzle-orm";
import { pages as pgPages } from "../schema/pages";
import { pageDrafts as pgPageDrafts } from "../schema/page_drafts";
import { pageVersions as pgPageVersions } from "../schema/page_versions";
import { pageVersionApprovals as pgPageVersionApprovals } from "../schema/page_version_approvals";
import { pageTemplates as pgPageTemplates } from "../schema/page_templates";
import { pageDraftLocks as pgPageDraftLocks } from "../schema/page_draft_locks";
import type { BaseBlock } from "../core/types/blocks";
import type { Localized, PageType } from "../core/types/pages";

export interface PageTables {
  pages?: any;
  pageDrafts?: any;
  pageVersions?: any;
  pageVersionApprovals?: any;
  pageTemplates?: any;
  pageDraftLocks?: any;
}

function resolveTables(tables?: PageTables) {
  return {
    pages: tables?.pages || pgPages,
    pageDrafts: tables?.pageDrafts || pgPageDrafts,
    pageVersions: tables?.pageVersions || pgPageVersions,
    pageVersionApprovals: tables?.pageVersionApprovals || pgPageVersionApprovals,
    pageTemplates: tables?.pageTemplates || pgPageTemplates,
    pageDraftLocks: tables?.pageDraftLocks || pgPageDraftLocks,
  };
}

export interface ListPagesOptions {
  type?: string;
  limit?: number;
  offset?: number;
  includeDeleted?: boolean;
}

export interface CreatePageInput {
  slug: string;
  type: PageType;
  title: Localized;
  description?: Localized | null;
  templateId?: string | null;
  templateVersion?: number;
  tags?: Localized[];
  authorIds?: string[];
  bylines?: any[];
  content?: {
    blocks: BaseBlock[];
    properties: Record<string, any>;
  };
}

export interface UpdatePageInput {
  slug?: string;
  type?: PageType;
  title?: Localized;
  description?: Localized | null;
  tags?: Localized[];
  authorIds?: string[];
  bylines?: any[];
  content?: {
    blocks: BaseBlock[];
    properties: Record<string, any>;
  };
}

export interface SaveDraftInput {
  userId: string;
  content: {
    blocks: BaseBlock[];
    properties: Record<string, any>;
  };
}

export interface PublishPageInput {
  userId: string;
  userRoles?: string[];
  changeSummary?: string;
  content?: {
    blocks: BaseBlock[];
    properties: Record<string, any>;
  };
}

export interface ApprovalCheckResult {
  canPublish: boolean;
  reason: string | null;
}

export const PageService = {
  async listPages(db: any, opts: ListPagesOptions = {}, tables?: PageTables) {
    const t = resolveTables(tables);
    const limit = opts.limit ?? 50;
    const offset = opts.offset ?? 0;

    let query = db.select().from(t.pages);
    const conditions = [];

    if (!opts.includeDeleted) {
      conditions.push(isNull(t.pages.deletedAt));
    }
    if (opts.type) {
      conditions.push(eq(t.pages.type, opts.type));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return query.orderBy(desc(t.pages.createdAt)).limit(limit).offset(offset);
  },

  async getPageById(db: any, id: string, tables?: PageTables) {
    const t = resolveTables(tables);
    const rows = await db.select().from(t.pages).where(eq(t.pages.id, id)).limit(1);
    return rows[0] || null;
  },

  async getPageBySlug(db: any, slug: string, tables?: PageTables) {
    const t = resolveTables(tables);
    const rows = await db
      .select()
      .from(t.pages)
      .where(and(eq(t.pages.slug, slug), isNull(t.pages.deletedAt)))
      .limit(1);
    return rows[0] || null;
  },

  async createPage(db: any, input: CreatePageInput, tables?: PageTables) {
    const t = resolveTables(tables);
    const [page] = await db
      .insert(t.pages)
      .values({
        slug: input.slug,
        type: input.type,
        templateId: input.templateId || null,
        templateVersion: input.templateVersion ?? 1,
        title: input.title,
        description: input.description || null,
        tags: input.tags || [],
        authorIds: input.authorIds || [],
        bylines: input.bylines || [],
        content: input.content || { blocks: [], properties: {} },
      })
      .returning();
    return page;
  },

  async updatePage(db: any, id: string, input: UpdatePageInput, tables?: PageTables) {
    const t = resolveTables(tables);
    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (input.slug !== undefined) updateData["slug"] = input.slug;
    if (input.type !== undefined) updateData["type"] = input.type;
    if (input.title !== undefined) updateData["title"] = input.title;
    if (input.description !== undefined) updateData["description"] = input.description;
    if (input.tags !== undefined) updateData["tags"] = input.tags;
    if (input.authorIds !== undefined) updateData["authorIds"] = input.authorIds;
    if (input.bylines !== undefined) updateData["bylines"] = input.bylines;
    if (input.content !== undefined) updateData["content"] = input.content;

    const [updated] = await db
      .update(t.pages)
      .set(updateData)
      .where(eq(t.pages.id, id))
      .returning();
    return updated || null;
  },

  async deletePage(db: any, id: string, tables?: PageTables) {
    const t = resolveTables(tables);
    const [deleted] = await db
      .update(t.pages)
      .set({ deletedAt: new Date() })
      .where(eq(t.pages.id, id))
      .returning();
    return deleted || null;
  },

  async getDraft(db: any, pageId: string, tables?: PageTables) {
    const t = resolveTables(tables);
    const rows = await db
      .select()
      .from(t.pageDrafts)
      .where(eq(t.pageDrafts.pageId, pageId))
      .limit(1);
    return rows[0] || null;
  },

  async saveDraft(db: any, pageId: string, input: SaveDraftInput, tables?: PageTables) {
    const t = resolveTables(tables);
    // Upsert draft
    const existing = await this.getDraft(db, pageId, tables);
    if (existing) {
      const [updated] = await db
        .update(t.pageDrafts)
        .set({
          content: input.content,
          updatedBy: input.userId,
          updatedAt: new Date(),
        })
        .where(eq(t.pageDrafts.pageId, pageId))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(t.pageDrafts)
      .values({
        pageId,
        content: input.content,
        updatedBy: input.userId,
        updatedAt: new Date(),
      })
      .returning();
    return created;
  },

  async checkApprovalRequirements(
    db: any,
    pageId: string,
    userId: string,
    userRoles: string[],
    tables?: PageTables,
  ): Promise<ApprovalCheckResult> {
    const t = resolveTables(tables);
    const page = await this.getPageById(db, pageId, tables);
    if (!page || !page.templateId) {
      return { canPublish: true, reason: null };
    }

    const templateRows = await db
      .select()
      .from(t.pageTemplates)
      .where(eq(t.pageTemplates.id, page.templateId))
      .limit(1);
    const template = templateRows[0];
    if (!template) {
      return { canPublish: true, reason: null };
    }

    const approvalRules = template.approvalRules || {
      allowSelfApproval: true,
      minApprovals: 1,
    };
    const minApprovals = approvalRules.minApprovals ?? 1;

    const lastVersionRows = await db
      .select()
      .from(t.pageVersions)
      .where(eq(t.pageVersions.pageId, pageId))
      .orderBy(desc(t.pageVersions.versionNumber))
      .limit(1);
    const lastVersion = lastVersionRows[0];

    let existingApprovals: any[] = [];
    if (lastVersion) {
      existingApprovals = await db
        .select()
        .from(t.pageVersionApprovals)
        .where(eq(t.pageVersionApprovals.versionId, lastVersion.id))
        .limit(10);
    }

    const requiredRoles = template.rolePermissions?.whoCanReview?.length
      ? template.rolePermissions.whoCanReview
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
  },

  async publishPage(db: any, pageId: string, input: PublishPageInput, tables?: PageTables) {
    const t = resolveTables(tables);
    const page = await this.getPageById(db, pageId, tables);
    if (!page) {
      throw new Error(`Page '${pageId}' not found`);
    }

    const userRoles = input.userRoles || ["member"];
    const approvalCheck = await this.checkApprovalRequirements(
      db,
      pageId,
      input.userId,
      userRoles,
      tables,
    );
    if (!approvalCheck.canPublish) {
      throw new Error(approvalCheck.reason || "Publishing not approved");
    }

    let contentToPublish = input.content;
    if (!contentToPublish) {
      const draft = await this.getDraft(db, pageId, tables);
      contentToPublish = draft?.content || page.content;
    }

    const lastVersionRows = await db
      .select()
      .from(t.pageVersions)
      .where(eq(t.pageVersions.pageId, pageId))
      .orderBy(desc(t.pageVersions.versionNumber))
      .limit(1);
    const nextVersionNumber = (lastVersionRows[0]?.versionNumber || 0) + 1;

    const [version] = await db
      .insert(t.pageVersions)
      .values({
        pageId,
        versionNumber: nextVersionNumber,
        status: "published",
        slug: page.slug,
        type: page.type,
        title: page.title,
        description: page.description,
        tags: page.tags,
        authorIds: page.authorIds,
        content: contentToPublish,
        createdBy: input.userId,
        approvedBy: [input.userId],
        approvedAt: new Date(),
        changeSummary: input.changeSummary || null,
        createdAt: new Date(),
      })
      .returning();

    await db.insert(t.pageVersionApprovals).values({
      versionId: version.id,
      userId: input.userId,
      userRole: userRoles[0] || "member",
      approvedAt: new Date(),
    });

    await db
      .update(t.pages)
      .set({
        content: contentToPublish,
        publishedVersionId: version.id,
        postedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(t.pages.id, pageId));

    return version;
  },

  async unpublishPage(db: any, pageId: string, tables?: PageTables) {
    const t = resolveTables(tables);
    const [page] = await db
      .update(t.pages)
      .set({
        publishedVersionId: null,
        updatedAt: new Date(),
      })
      .where(eq(t.pages.id, pageId))
      .returning();
    return page || null;
  },
};
