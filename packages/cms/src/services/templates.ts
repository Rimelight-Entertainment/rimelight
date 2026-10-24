import { desc, eq } from "drizzle-orm";
import { pageTemplates as pgPageTemplates } from "../schema/page_templates";
import type { BaseBlock } from "../core/types/blocks";
import type { Localized } from "../core/types/pages";

export interface TemplateTables {
  pageTemplates?: any;
}

function resolveTables(tables?: TemplateTables) {
  return {
    pageTemplates: tables?.pageTemplates || pgPageTemplates,
  };
}

export interface CreateTemplateInput {
  slug: string;
  title: Localized;
  description?: Localized | null;
  pageType: string;
  version?: number;
  allowedRoles?: string[];
  rolePermissions?: {
    whoCanCreate?: string[];
    whoCanEdit?: string[];
    whoCanReview?: string[];
    whoCanView?: string[];
  };
  requiredPermission?: string | null;
  approvalRules?: {
    allowSelfApproval?: boolean;
    minApprovals?: number;
    requiredRolesForApproval?: string[];
  };
  defaultProperties?: Record<string, any>;
  initialBlocks?: BaseBlock[];
}

export interface UpdateTemplateInput extends Partial<CreateTemplateInput> {}

export const TemplateService = {
  async listTemplates(db: any, tables?: TemplateTables) {
    const t = resolveTables(tables);
    return db.select().from(t.pageTemplates).orderBy(desc(t.pageTemplates.createdAt));
  },

  async getTemplateById(db: any, id: string, tables?: TemplateTables) {
    const t = resolveTables(tables);
    const rows = await db.select().from(t.pageTemplates).where(eq(t.pageTemplates.id, id)).limit(1);
    return rows[0] || null;
  },

  async getTemplateBySlug(db: any, slug: string, tables?: TemplateTables) {
    const t = resolveTables(tables);
    const rows = await db
      .select()
      .from(t.pageTemplates)
      .where(eq(t.pageTemplates.slug, slug))
      .limit(1);
    return rows[0] || null;
  },

  async createTemplate(db: any, input: CreateTemplateInput, tables?: TemplateTables) {
    const t = resolveTables(tables);
    const [template] = await db
      .insert(t.pageTemplates)
      .values({
        slug: input.slug,
        title: input.title,
        description: input.description || null,
        pageType: input.pageType,
        version: input.version ?? 1,
        allowedRoles: input.allowedRoles || [],
        rolePermissions: input.rolePermissions || {
          whoCanCreate: [],
          whoCanEdit: [],
          whoCanReview: [],
          whoCanView: [],
        },
        requiredPermission: input.requiredPermission || null,
        approvalRules: input.approvalRules || {
          allowSelfApproval: true,
          minApprovals: 1,
        },
        defaultProperties: input.defaultProperties || {},
        initialBlocks: input.initialBlocks || [],
      })
      .returning();
    return template;
  },

  async updateTemplate(db: any, id: string, input: UpdateTemplateInput, tables?: TemplateTables) {
    const t = resolveTables(tables);
    const updateData: Record<string, any> = { updatedAt: new Date() };

    if (input.slug !== undefined) updateData["slug"] = input.slug;
    if (input.title !== undefined) updateData["title"] = input.title;
    if (input.description !== undefined) updateData["description"] = input.description;
    if (input.pageType !== undefined) updateData["pageType"] = input.pageType;
    if (input.version !== undefined) updateData["version"] = input.version;
    if (input.allowedRoles !== undefined) updateData["allowedRoles"] = input.allowedRoles;
    if (input.rolePermissions !== undefined) updateData["rolePermissions"] = input.rolePermissions;
    if (input.requiredPermission !== undefined)
      updateData["requiredPermission"] = input.requiredPermission;
    if (input.approvalRules !== undefined) updateData["approvalRules"] = input.approvalRules;
    if (input.defaultProperties !== undefined)
      updateData["defaultProperties"] = input.defaultProperties;
    if (input.initialBlocks !== undefined) updateData["initialBlocks"] = input.initialBlocks;

    const [updated] = await db
      .update(t.pageTemplates)
      .set(updateData)
      .where(eq(t.pageTemplates.id, id))
      .returning();
    return updated || null;
  },

  async deleteTemplate(db: any, id: string, tables?: TemplateTables) {
    const t = resolveTables(tables);
    await db.delete(t.pageTemplates).where(eq(t.pageTemplates.id, id));
    return true;
  },
};
