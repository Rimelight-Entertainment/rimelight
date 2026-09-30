import { and, desc, eq, isNotNull, isNull, like, or, sql } from "drizzle-orm";
import { pages } from "../schema/pages.ts";
import { pageDrafts } from "../schema/page_drafts.ts";
import { pageVersions } from "../schema/page_versions.ts";
import { pageTemplates } from "../schema/page_templates.ts";
import { contentTypes } from "../schema/content_types.ts";
import { bylines } from "../schema/bylines.ts";
import { taxonomyTerms, pageTaxonomyTerms } from "../schema/taxonomies.ts";
import { pageVersionApprovals } from "../schema/page_version_approvals.ts";
import { pageVersionComments } from "../schema/page_version_comments.ts";
import { getSiteSettings, updateSiteSettings } from "../services/site-settings.ts";
import { getTaxonomyTerms } from "../services/taxonomies.ts";
import { indexPageForSearch } from "../services/search-indexer.ts";
import type { PageType } from "../core/types/pages.ts";
import type { BaseBlock } from "../core/types/blocks.ts";

export const CMS_MCP_TOOLS = [
  // ─── 1. Pages & Drafts ──────────────────────────────────────────────────────
  {
    name: "cms_list_pages",
    description: "List CMS pages with optional filters for type, draft status, and pagination.",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          description: "Filter by page type (e.g. 'blog', 'doc', 'legal', 'wiki')",
        },
        includeDrafts: { type: "boolean", description: "Whether to include unpublished drafts" },
        limit: { type: "number", description: "Maximum number of pages to return (default 20)" },
        offset: { type: "number", description: "Offset for pagination (default 0)" },
      },
    },
  },
  {
    name: "cms_get_page",
    description:
      "Get full details, block tree, properties, bylines, and active draft for a page by slug or UUID.",
    inputSchema: {
      type: "object",
      properties: {
        slugOrId: { type: "string", description: "Page slug or UUID" },
      },
      required: ["slugOrId"],
    },
  },
  {
    name: "cms_create_page",
    description: "Create a new CMS page and its initial draft blocks.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "Unique URL slug for the page" },
        type: {
          type: "string",
          description: "Page type (e.g. 'blog', 'doc', 'legal', 'wiki', 'character')",
        },
        title: { type: "object", description: "Localized title object, e.g. { en: 'Page Title' }" },
        description: {
          type: "object",
          description: "Localized description object, e.g. { en: 'Page description' }",
        },
        templateId: {
          type: "string",
          description: "Optional UUID of the template to base the page on",
        },
        tags: { type: "array", description: "Array of localized tags or strings" },
        authorIds: { type: "array", description: "Array of author user IDs" },
        bylines: {
          type: "array",
          description: "Array of structured byline credits [{ bylineId, role, customCredit }]",
        },
        blocks: { type: "array", description: "Initial structured CMS blocks array" },
        properties: { type: "object", description: "Content type specific custom properties" },
      },
      required: ["slug", "type", "title"],
    },
  },
  {
    name: "cms_update_page",
    description: "Update an existing CMS page's metadata, properties, bylines, or content blocks.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Page UUID" },
        slug: { type: "string", description: "New unique slug" },
        title: { type: "object", description: "Localized title object" },
        description: { type: "object", description: "Localized description object" },
        tags: { type: "array", description: "Array of localized tags" },
        bylines: { type: "array", description: "Array of structured byline credits" },
        blocks: { type: "array", description: "Updated structured CMS blocks array" },
        properties: { type: "object", description: "Updated custom properties object" },
      },
      required: ["id"],
    },
  },
  {
    name: "cms_create_draft",
    description: "Create or update an in-progress draft version for a CMS page without publishing.",
    inputSchema: {
      type: "object",
      properties: {
        pageId: { type: "string", description: "Page UUID" },
        userId: { type: "string", description: "User or Agent ID creating the draft" },
        blocks: { type: "array", description: "Array of structured CMS blocks" },
        properties: { type: "object", description: "Page properties object" },
      },
      required: ["pageId", "userId", "blocks"],
    },
  },
  {
    name: "cms_publish_page",
    description: "Publish a page draft, creating a new immutable version snapshot.",
    inputSchema: {
      type: "object",
      properties: {
        pageId: { type: "string", description: "Page UUID" },
        userId: { type: "string", description: "User or Agent ID publishing the page" },
        changeSummary: { type: "string", description: "Summary of changes in this version" },
      },
      required: ["pageId", "userId"],
    },
  },
  {
    name: "cms_unpublish_page",
    description: "Unpublish a live page, reverting it to draft status.",
    inputSchema: {
      type: "object",
      properties: {
        pageId: { type: "string", description: "Page UUID to unpublish" },
      },
      required: ["pageId"],
    },
  },
  {
    name: "cms_delete_page",
    description: "Soft delete a CMS page by setting deleted_at.",
    inputSchema: {
      type: "object",
      properties: {
        pageId: { type: "string", description: "Page UUID to delete" },
      },
      required: ["pageId"],
    },
  },

  // ─── 2. Page Versions & Approvals ───────────────────────────────────────────
  {
    name: "cms_list_page_versions",
    description: "List version history snapshots for a page.",
    inputSchema: {
      type: "object",
      properties: {
        pageId: { type: "string", description: "Page UUID" },
        limit: { type: "number", description: "Max versions to return (default 20)" },
      },
      required: ["pageId"],
    },
  },
  {
    name: "cms_get_page_version",
    description: "Get full snapshot content and block tree for a specific version.",
    inputSchema: {
      type: "object",
      properties: {
        versionId: { type: "string", description: "Version UUID" },
      },
      required: ["versionId"],
    },
  },
  {
    name: "cms_rollback_page_version",
    description: "Rollback a page's working draft or live content to a past version snapshot.",
    inputSchema: {
      type: "object",
      properties: {
        pageId: { type: "string", description: "Page UUID" },
        versionId: { type: "string", description: "Target Version UUID to rollback to" },
        userId: { type: "string", description: "User or Agent ID performing rollback" },
      },
      required: ["pageId", "versionId", "userId"],
    },
  },
  {
    name: "cms_approve_page_version",
    description: "Record an editorial review approval for a version.",
    inputSchema: {
      type: "object",
      properties: {
        versionId: { type: "string", description: "Version UUID" },
        userId: { type: "string", description: "Approver user or agent ID" },
        userRole: { type: "string", description: "Approver role, e.g. 'Editor', 'Admin'" },
      },
      required: ["versionId", "userId", "userRole"],
    },
  },
  {
    name: "cms_add_version_comment",
    description: "Add an editorial or block-level comment to a version.",
    inputSchema: {
      type: "object",
      properties: {
        versionId: { type: "string", description: "Version UUID" },
        userId: { type: "string", description: "Author user or agent ID" },
        userRole: { type: "string", description: "Author role" },
        content: { type: "string", description: "Comment body text" },
        blockId: { type: "string", description: "Optional specific block ID target" },
      },
      required: ["versionId", "userId", "userRole", "content"],
    },
  },

  // ─── 3. Templates ───────────────────────────────────────────────────────────
  {
    name: "cms_list_templates",
    description: "List all page templates with starter blocks and property schemas.",
    inputSchema: {
      type: "object",
      properties: {
        pageType: { type: "string", description: "Optional filter by page type" },
      },
    },
  },
  {
    name: "cms_get_template",
    description: "Get template definition by slug or UUID.",
    inputSchema: {
      type: "object",
      properties: {
        slugOrId: { type: "string", description: "Template slug or UUID" },
      },
      required: ["slugOrId"],
    },
  },
  {
    name: "cms_create_template",
    description: "Create a new page template with default property groups and starter blocks.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "Unique template slug" },
        title: { type: "object", description: "Localized title, e.g. { en: 'Wiki Template' }" },
        description: { type: "object", description: "Localized description" },
        pageType: { type: "string", description: "Page type target" },
        version: { type: "number", description: "Template version number (default 1)" },
        allowedRoles: { type: "array", description: "Roles allowed to use this template" },
        rolePermissions: { type: "object", description: "Granular template role permissions" },
        approvalRules: { type: "object", description: "Approval workflow configuration" },
        defaultProperties: { type: "object", description: "Default property schema groups" },
        initialBlocks: { type: "array", description: "Starter structured CMS blocks" },
      },
      required: ["slug", "title", "pageType"],
    },
  },
  {
    name: "cms_update_template",
    description: "Update an existing page template.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Template UUID" },
        slug: { type: "string" },
        title: { type: "object" },
        description: { type: "object" },
        pageType: { type: "string" },
        version: { type: "number" },
        defaultProperties: { type: "object" },
        initialBlocks: { type: "array" },
        rolePermissions: { type: "object" },
        approvalRules: { type: "object" },
      },
      required: ["id"],
    },
  },
  {
    name: "cms_delete_template",
    description: "Delete a page template by UUID.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Template UUID" },
      },
      required: ["id"],
    },
  },

  // ─── 4. Taxonomies (Categories & Tags) ──────────────────────────────────────
  {
    name: "cms_list_taxonomies",
    description: "List taxonomy terms (categories, tags, genres, etc.) with usage counts.",
    inputSchema: {
      type: "object",
      properties: {
        taxonomy: { type: "string", description: "Taxonomy type, e.g. 'category', 'tag'" },
      },
      required: ["taxonomy"],
    },
  },
  {
    name: "cms_create_taxonomy_term",
    description: "Create a new taxonomy term (category or tag).",
    inputSchema: {
      type: "object",
      properties: {
        taxonomy: { type: "string", description: "'category', 'tag', or custom taxonomy name" },
        slug: { type: "string", description: "Unique slug within taxonomy" },
        label: { type: "object", description: "Localized label or string, e.g. { en: 'Guides' }" },
        description: { type: "object", description: "Localized description" },
        parentId: { type: "string", description: "Optional parent category UUID for hierarchy" },
        displayOrder: { type: "number", description: "Display sort order" },
      },
      required: ["taxonomy", "slug", "label"],
    },
  },
  {
    name: "cms_update_taxonomy_term",
    description: "Update an existing taxonomy term by UUID.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Taxonomy term UUID" },
        slug: { type: "string" },
        label: { type: "object" },
        description: { type: "object" },
        parentId: { type: "string" },
        displayOrder: { type: "number" },
      },
      required: ["id"],
    },
  },
  {
    name: "cms_delete_taxonomy_term",
    description: "Delete a taxonomy term by UUID.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Taxonomy term UUID" },
      },
      required: ["id"],
    },
  },
  {
    name: "cms_assign_page_taxonomy",
    description: "Assign or unassign taxonomy terms to/from a page.",
    inputSchema: {
      type: "object",
      properties: {
        pageId: { type: "string", description: "Page UUID" },
        termIds: {
          type: "array",
          description: "Array of taxonomy term UUIDs to assign to the page",
        },
      },
      required: ["pageId", "termIds"],
    },
  },

  // ─── 5. Bylines & Author Schemas ────────────────────────────────────────────
  {
    name: "cms_list_bylines",
    description: "List all registered author and contributor bylines.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "cms_get_byline",
    description: "Get a specific byline profile by slug or UUID.",
    inputSchema: {
      type: "object",
      properties: {
        slugOrId: { type: "string", description: "Byline slug or UUID" },
      },
      required: ["slugOrId"],
    },
  },
  {
    name: "cms_create_byline",
    description: "Create an author, creator, or studio byline profile.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Display name" },
        slug: { type: "string", description: "Unique URL slug" },
        websiteUrl: { type: "string", description: "Author website URL" },
        bio: { type: "string", description: "Bio or summary text" },
        avatar: { type: "string", description: "Avatar image URL or asset key" },
        userId: { type: "string", description: "Linked user ID if applicable" },
        socials: {
          type: "object",
          description: "Social links, e.g. { twitter: '...', github: '...' }",
        },
        metadata: { type: "object", description: "Custom author metadata" },
      },
      required: ["name", "slug"],
    },
  },
  {
    name: "cms_update_byline",
    description: "Update an existing byline profile.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Byline UUID" },
        name: { type: "string" },
        slug: { type: "string" },
        websiteUrl: { type: "string" },
        bio: { type: "string" },
        avatar: { type: "string" },
        userId: { type: "string" },
        socials: { type: "object" },
        metadata: { type: "object" },
      },
      required: ["id"],
    },
  },
  {
    name: "cms_delete_byline",
    description: "Delete an author byline profile by UUID.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Byline UUID" },
      },
      required: ["id"],
    },
  },

  // ─── 6. Dynamic Content Types & E-Commerce Collections ──────────────────────
  {
    name: "cms_list_content_types",
    description: "List all dynamic content types, collections, and e-commerce models.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "cms_get_content_type",
    description: "Get dynamic content type definition by slug or UUID.",
    inputSchema: {
      type: "object",
      properties: {
        slugOrId: { type: "string", description: "Content type slug or UUID" },
      },
      required: ["slugOrId"],
    },
  },
  {
    name: "cms_create_content_type",
    description: "Create a new dynamic collection, content type, or e-commerce schema.",
    inputSchema: {
      type: "object",
      properties: {
        slug: {
          type: "string",
          description: "Unique slug identifier (e.g. 'products', 'characters')",
        },
        name: { type: "object", description: "Localized name, e.g. { en: 'Products' }" },
        description: { type: "object", description: "Localized description" },
        icon: { type: "string", description: "Icon name (e.g. 'i-lucide-shopping-bag')" },
        mode: {
          type: "string",
          description: "'document' (blocks), 'data' (structured table), or 'singleton'",
        },
        fieldSchema: {
          type: "object",
          description: "Dynamic property field schemas and validation rules",
        },
        ecomSettings: {
          type: "object",
          description:
            "E-commerce settings { enabled, currencyDefault, trackInventory, hasVariants, allowDigitalDownloads, stripeSync }",
        },
        initialBlocks: { type: "array", description: "Starter blocks for document mode" },
        isSystem: { type: "boolean", description: "Whether this is a protected system schema" },
      },
      required: ["slug", "name"],
    },
  },
  {
    name: "cms_update_content_type",
    description: "Update an existing dynamic content type schema or e-commerce settings.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Content type UUID" },
        slug: { type: "string" },
        name: { type: "object" },
        description: { type: "object" },
        icon: { type: "string" },
        mode: { type: "string" },
        fieldSchema: { type: "object" },
        ecomSettings: { type: "object" },
        initialBlocks: { type: "array" },
      },
      required: ["id"],
    },
  },
  {
    name: "cms_delete_content_type",
    description: "Delete a custom dynamic content type by UUID.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Content type UUID" },
      },
      required: ["id"],
    },
  },

  // ─── 7. Site Settings ───────────────────────────────────────────────────────
  {
    name: "cms_get_site_settings",
    description: "Retrieve current dynamic site settings including branding and SEO defaults.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "cms_update_site_settings",
    description: "Update dynamic site settings (name, description, branding, SEO).",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        author: { type: "string" },
        email: { type: "string" },
        branding: { type: "object" },
        seo: { type: "object" },
      },
    },
  },

  // ─── 8. Search ──────────────────────────────────────────────────────────────
  {
    name: "cms_search_content",
    description: "Search across active CMS pages by keyword.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query text" },
        type: { type: "string", description: "Optional filter by page type" },
        limit: { type: "number", description: "Max results to return (default 10)" },
      },
      required: ["query"],
    },
  },
];

/**
 * Handles Model Context Protocol (MCP) JSON-RPC requests for CMS tools.
 */
export async function handleCmsMcpRequest(
  body: {
    jsonrpc?: string;
    id?: string | number;
    method: string;
    params?: any;
  },
  db: any,
): Promise<any> {
  const { id = 1, method, params = {} } = body;

  if (method === "tools/list") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        tools: CMS_MCP_TOOLS,
      },
    };
  }

  if (method === "tools/call") {
    const { name, arguments: args = {} } = params;

    switch (name) {
      // ─── Pages ───────────────────────────────────────────────────────────────
      case "cms_list_pages": {
        const conditions = [isNull(pages.deletedAt)];
        if (args.type) {
          conditions.push(eq(pages.type, args.type as PageType));
        }
        if (!args.includeDrafts) {
          conditions.push(isNotNull(pages.publishedVersionId));
        }

        const queryLimit = typeof args.limit === "number" ? args.limit : 20;
        const queryOffset = typeof args.offset === "number" ? args.offset : 0;
        const rows = await db
          .select({
            id: pages.id,
            slug: pages.slug,
            type: pages.type,
            title: pages.title,
            description: pages.description,
            postedAt: pages.postedAt,
            publishedVersionId: pages.publishedVersionId,
            createdAt: pages.createdAt,
            updatedAt: pages.updatedAt,
          })
          .from(pages)
          .where(and(...conditions))
          .orderBy(desc(pages.postedAt), desc(pages.createdAt))
          .limit(queryLimit)
          .offset(queryOffset);

        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
          },
        };
      }

      case "cms_get_page": {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          args.slugOrId,
        );
        const condition = isUuid ? eq(pages.id, args.slugOrId) : eq(pages.slug, args.slugOrId);

        const row = await db
          .select()
          .from(pages)
          .where(and(isNull(pages.deletedAt), condition))
          .limit(1);
        const page = row[0] || null;
        if (!page) {
          return {
            jsonrpc: "2.0",
            id,
            error: { code: -32004, message: `Page '${args.slugOrId}' not found` },
          };
        }

        let draft = null;
        try {
          const draftRow = await db
            .select()
            .from(pageDrafts)
            .where(eq(pageDrafts.pageId, page.id))
            .limit(1);
          draft = draftRow[0] || null;
        } catch {}

        return {
          jsonrpc: "2.0",
          id,
          result: { content: [{ type: "text", text: JSON.stringify({ page, draft }, null, 2) }] },
        };
      }

      case "cms_create_page": {
        const titlePayload = typeof args.title === "string" ? { en: args.title } : args.title;
        const descPayload =
          typeof args.description === "string"
            ? { en: args.description }
            : args.description || null;
        const blocksPayload = Array.isArray(args.blocks) ? args.blocks : [];
        const propertiesPayload = args.properties || {};

        const inserted = await db
          .insert(pages)
          .values({
            slug: args.slug,
            type: args.type as PageType,
            templateId: args.templateId || null,
            title: titlePayload,
            description: descPayload,
            tags: args.tags || [],
            authorIds: args.authorIds || [],
            bylines: args.bylines || [],
            content: {
              blocks: blocksPayload,
              properties: propertiesPayload,
            },
          })
          .returning();

        const newPage = inserted[0];
        if (newPage) {
          try {
            await db
              .insert(pageDrafts)
              .values({
                pageId: newPage.id,
                updatedBy: args.authorIds?.[0] || "agent",
                content: { blocks: blocksPayload, properties: propertiesPayload },
              })
              .onConflictDoNothing();
          } catch {}
        }

        return {
          jsonrpc: "2.0",
          id,
          result: { content: [{ type: "text", text: JSON.stringify(newPage, null, 2) }] },
        };
      }

      case "cms_update_page": {
        const updateData: Record<string, any> = { updatedAt: new Date() };
        if (args.slug) updateData["slug"] = args.slug;
        if (args.title)
          updateData["title"] = typeof args.title === "string" ? { en: args.title } : args.title;
        if (args.description !== undefined) {
          updateData["description"] =
            typeof args.description === "string" ? { en: args.description } : args.description;
        }
        if (args.tags) updateData["tags"] = args.tags;
        if (args.bylines) updateData["bylines"] = args.bylines;

        if (args.blocks || args.properties) {
          const current = await db.select().from(pages).where(eq(pages.id, args.id)).limit(1);
          const existingContent = current[0]?.content || { blocks: [], properties: {} };
          updateData["content"] = {
            blocks: args.blocks || existingContent.blocks || [],
            properties: args.properties || existingContent.properties || {},
          };
        }

        const updated = await db
          .update(pages)
          .set(updateData)
          .where(eq(pages.id, args.id))
          .returning();
        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: JSON.stringify(updated[0] || null, null, 2) }],
          },
        };
      }

      case "cms_create_draft": {
        const contentPayload = {
          blocks: args.blocks as BaseBlock[],
          properties: args.properties || {},
        };

        const draft = await db
          .insert(pageDrafts)
          .values({
            pageId: args.pageId,
            updatedBy: args.userId,
            content: contentPayload,
          })
          .onConflictDoUpdate({
            target: [pageDrafts.pageId],
            set: {
              content: contentPayload,
              updatedBy: args.userId,
              updatedAt: new Date(),
            },
          })
          .returning();

        return {
          jsonrpc: "2.0",
          id,
          result: { content: [{ type: "text", text: JSON.stringify(draft[0], null, 2) }] },
        };
      }

      case "cms_publish_page": {
        const pageResult = await db.select().from(pages).where(eq(pages.id, args.pageId)).limit(1);
        const page = pageResult[0];
        if (!page) {
          return {
            jsonrpc: "2.0",
            id,
            error: { code: -32004, message: `Page '${args.pageId}' not found` },
          };
        }

        const draftResult = await db
          .select()
          .from(pageDrafts)
          .where(eq(pageDrafts.pageId, args.pageId))
          .limit(1);
        const content = draftResult[0]?.content || page.content;

        const lastVersion = await db
          .select()
          .from(pageVersions)
          .where(eq(pageVersions.pageId, args.pageId))
          .orderBy(desc(pageVersions.versionNumber))
          .limit(1);

        const nextVersionNumber = (lastVersion[0]?.versionNumber || 0) + 1;

        const versionResult = await db
          .insert(pageVersions)
          .values({
            pageId: args.pageId,
            versionNumber: nextVersionNumber,
            status: "published",
            slug: page.slug,
            type: page.type,
            title: page.title,
            description: page.description,
            tags: page.tags,
            authorIds: page.authorIds,
            bylines: page.bylines,
            content,
            createdBy: args.userId,
            approvedBy: [args.userId],
            approvedAt: new Date(),
            changeSummary: args.changeSummary || "Published via MCP",
            createdAt: new Date(),
          })
          .returning();

        const version = versionResult[0];

        await db
          .update(pages)
          .set({
            content,
            publishedVersionId: version.id,
            postedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(pages.id, args.pageId));

        await indexPageForSearch(db, { id: args.pageId, title: page.title, content }, ["en", "pt"]);

        return {
          jsonrpc: "2.0",
          id,
          result: { content: [{ type: "text", text: JSON.stringify(version, null, 2) }] },
        };
      }

      case "cms_unpublish_page": {
        const updated = await db
          .update(pages)
          .set({ postedAt: null, publishedVersionId: null, updatedAt: new Date() })
          .where(eq(pages.id, args.pageId))
          .returning();

        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify({ success: true, page: updated[0] || null }, null, 2),
              },
            ],
          },
        };
      }

      case "cms_delete_page": {
        const deleted = await db
          .update(pages)
          .set({ deletedAt: new Date() })
          .where(eq(pages.id, args.pageId))
          .returning();

        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify({ success: true, page: deleted[0] || null }, null, 2),
              },
            ],
          },
        };
      }

      // ─── Versions & Reviews ───────────────────────────────────────────────────
      case "cms_list_page_versions": {
        const vLimit = typeof args.limit === "number" ? args.limit : 20;
        const rows = await db
          .select()
          .from(pageVersions)
          .where(eq(pageVersions.pageId, args.pageId))
          .orderBy(desc(pageVersions.versionNumber))
          .limit(vLimit);

        return {
          jsonrpc: "2.0",
          id,
          result: { content: [{ type: "text", text: JSON.stringify(rows, null, 2) }] },
        };
      }

      case "cms_get_page_version": {
        const row = await db
          .select()
          .from(pageVersions)
          .where(eq(pageVersions.id, args.versionId))
          .limit(1);
        return {
          jsonrpc: "2.0",
          id,
          result: { content: [{ type: "text", text: JSON.stringify(row[0] || null, null, 2) }] },
        };
      }

      case "cms_rollback_page_version": {
        const vRow = await db
          .select()
          .from(pageVersions)
          .where(eq(pageVersions.id, args.versionId))
          .limit(1);
        const targetVersion = vRow[0];
        if (!targetVersion) {
          return {
            jsonrpc: "2.0",
            id,
            error: { code: -32004, message: "Version snapshot not found" },
          };
        }

        const draft = await db
          .insert(pageDrafts)
          .values({
            pageId: args.pageId,
            updatedBy: args.userId,
            content: targetVersion.content,
          })
          .onConflictDoUpdate({
            target: [pageDrafts.pageId],
            set: {
              content: targetVersion.content,
              updatedBy: args.userId,
              updatedAt: new Date(),
            },
          })
          .returning();

        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    rolledBackToVersion: targetVersion.versionNumber,
                    draft: draft[0],
                  },
                  null,
                  2,
                ),
              },
            ],
          },
        };
      }

      case "cms_approve_page_version": {
        const approval = await db
          .insert(pageVersionApprovals)
          .values({
            versionId: args.versionId,
            userId: args.userId,
            userRole: args.userRole,
            approvedAt: new Date(),
          })
          .returning();

        return {
          jsonrpc: "2.0",
          id,
          result: { content: [{ type: "text", text: JSON.stringify(approval[0], null, 2) }] },
        };
      }

      case "cms_add_version_comment": {
        const comment = await db
          .insert(pageVersionComments)
          .values({
            versionId: args.versionId,
            userId: args.userId,
            userRole: args.userRole,
            content: args.content,
            blockId: args.blockId || null,
            createdAt: new Date(),
          })
          .returning();

        return {
          jsonrpc: "2.0",
          id,
          result: { content: [{ type: "text", text: JSON.stringify(comment[0], null, 2) }] },
        };
      }

      // ─── Templates ───────────────────────────────────────────────────────────
      case "cms_list_templates": {
        const conditions = [];
        if (args.pageType) {
          conditions.push(eq(pageTemplates.pageType, args.pageType));
        }
        const rows = await db
          .select()
          .from(pageTemplates)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(desc(pageTemplates.createdAt));

        return {
          jsonrpc: "2.0",
          id,
          result: { content: [{ type: "text", text: JSON.stringify(rows, null, 2) }] },
        };
      }

      case "cms_get_template": {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          args.slugOrId,
        );
        const condition = isUuid
          ? eq(pageTemplates.id, args.slugOrId)
          : eq(pageTemplates.slug, args.slugOrId);
        const row = await db.select().from(pageTemplates).where(condition).limit(1);

        return {
          jsonrpc: "2.0",
          id,
          result: { content: [{ type: "text", text: JSON.stringify(row[0] || null, null, 2) }] },
        };
      }

      case "cms_create_template": {
        const titlePayload = typeof args.title === "string" ? { en: args.title } : args.title;
        const descPayload =
          typeof args.description === "string"
            ? { en: args.description }
            : args.description || null;

        const tmpl = await db
          .insert(pageTemplates)
          .values({
            slug: args.slug,
            title: titlePayload,
            description: descPayload,
            pageType: args.pageType,
            version: args.version || 1,
            allowedRoles: args.allowedRoles || [],
            rolePermissions: args.rolePermissions || {
              whoCanCreate: [],
              whoCanEdit: [],
              whoCanReview: [],
              whoCanView: [],
            },
            approvalRules: args.approvalRules || { allowSelfApproval: true, minApprovals: 1 },
            defaultProperties: args.defaultProperties || {},
            initialBlocks: args.initialBlocks || [],
          })
          .returning();

        return {
          jsonrpc: "2.0",
          id,
          result: { content: [{ type: "text", text: JSON.stringify(tmpl[0], null, 2) }] },
        };
      }

      case "cms_update_template": {
        const updateData: Record<string, any> = { updatedAt: new Date() };
        if (args.slug) updateData["slug"] = args.slug;
        if (args.title)
          updateData["title"] = typeof args.title === "string" ? { en: args.title } : args.title;
        if (args.description !== undefined) {
          updateData["description"] =
            typeof args.description === "string" ? { en: args.description } : args.description;
        }
        if (args.pageType) updateData["pageType"] = args.pageType;
        if (args.version) updateData["version"] = args.version;
        if (args.defaultProperties) updateData["defaultProperties"] = args.defaultProperties;
        if (args.initialBlocks) updateData["initialBlocks"] = args.initialBlocks;
        if (args.rolePermissions) updateData["rolePermissions"] = args.rolePermissions;
        if (args.approvalRules) updateData["approvalRules"] = args.approvalRules;

        const updated = await db
          .update(pageTemplates)
          .set(updateData)
          .where(eq(pageTemplates.id, args.id))
          .returning();
        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: JSON.stringify(updated[0] || null, null, 2) }],
          },
        };
      }

      case "cms_delete_template": {
        const deleted = await db
          .delete(pageTemplates)
          .where(eq(pageTemplates.id, args.id))
          .returning();
        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify({ success: true, template: deleted[0] || null }, null, 2),
              },
            ],
          },
        };
      }

      // ─── Taxonomies ───────────────────────────────────────────────────────────
      case "cms_list_taxonomies": {
        const terms = await getTaxonomyTerms(db, args.taxonomy);
        return {
          jsonrpc: "2.0",
          id,
          result: { content: [{ type: "text", text: JSON.stringify(terms, null, 2) }] },
        };
      }

      case "cms_create_taxonomy_term": {
        const labelPayload = typeof args.label === "string" ? { en: args.label } : args.label;
        const descPayload =
          typeof args.description === "string"
            ? { en: args.description }
            : args.description || null;

        const term = await db
          .insert(taxonomyTerms)
          .values({
            taxonomy: args.taxonomy,
            slug: args.slug,
            label: labelPayload,
            description: descPayload,
            parentId: args.parentId || null,
            displayOrder: args.displayOrder || 0,
          })
          .returning();

        return {
          jsonrpc: "2.0",
          id,
          result: { content: [{ type: "text", text: JSON.stringify(term[0], null, 2) }] },
        };
      }

      case "cms_update_taxonomy_term": {
        const updateData: Record<string, any> = { updatedAt: new Date() };
        if (args.slug) updateData["slug"] = args.slug;
        if (args.label)
          updateData["label"] = typeof args.label === "string" ? { en: args.label } : args.label;
        if (args.description !== undefined) {
          updateData["description"] =
            typeof args.description === "string" ? { en: args.description } : args.description;
        }
        if (args.parentId !== undefined) updateData["parentId"] = args.parentId || null;
        if (args.displayOrder !== undefined) updateData["displayOrder"] = args.displayOrder;

        const updated = await db
          .update(taxonomyTerms)
          .set(updateData)
          .where(eq(taxonomyTerms.id, args.id))
          .returning();
        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: JSON.stringify(updated[0] || null, null, 2) }],
          },
        };
      }

      case "cms_delete_taxonomy_term": {
        const deleted = await db
          .delete(taxonomyTerms)
          .where(eq(taxonomyTerms.id, args.id))
          .returning();
        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify({ success: true, term: deleted[0] || null }, null, 2),
              },
            ],
          },
        };
      }

      case "cms_assign_page_taxonomy": {
        // Clear current assignments and re-assign
        await db.delete(pageTaxonomyTerms).where(eq(pageTaxonomyTerms.pageId, args.pageId));
        const termIds = Array.isArray(args.termIds) ? args.termIds : [];
        const assigned = [];
        for (const termId of termIds) {
          const row = await db
            .insert(pageTaxonomyTerms)
            .values({ pageId: args.pageId, termId })
            .returning();
          assigned.push(row[0]);
        }

        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify({ success: true, assignedCount: assigned.length }, null, 2),
              },
            ],
          },
        };
      }

      // ─── Bylines ─────────────────────────────────────────────────────────────
      case "cms_list_bylines": {
        const rows = await db
          .select()
          .from(bylines)
          .where(isNull(bylines.deletedAt))
          .orderBy(desc(bylines.createdAt));

        return {
          jsonrpc: "2.0",
          id,
          result: { content: [{ type: "text", text: JSON.stringify(rows, null, 2) }] },
        };
      }

      case "cms_get_byline": {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          args.slugOrId,
        );
        const condition = isUuid ? eq(bylines.id, args.slugOrId) : eq(bylines.slug, args.slugOrId);
        const row = await db
          .select()
          .from(bylines)
          .where(and(isNull(bylines.deletedAt), condition))
          .limit(1);

        return {
          jsonrpc: "2.0",
          id,
          result: { content: [{ type: "text", text: JSON.stringify(row[0] || null, null, 2) }] },
        };
      }

      case "cms_create_byline": {
        const row = await db
          .insert(bylines)
          .values({
            name: args.name,
            slug: args.slug,
            websiteUrl: args.websiteUrl || null,
            bio: args.bio || null,
            avatar: args.avatar || null,
            userId: args.userId || null,
            socials: args.socials || {},
            metadata: args.metadata || {},
          })
          .returning();

        return {
          jsonrpc: "2.0",
          id,
          result: { content: [{ type: "text", text: JSON.stringify(row[0], null, 2) }] },
        };
      }

      case "cms_update_byline": {
        const updateData: Record<string, any> = { updatedAt: new Date() };
        if (args.name) updateData["name"] = args.name;
        if (args.slug) updateData["slug"] = args.slug;
        if (args.websiteUrl !== undefined) updateData["websiteUrl"] = args.websiteUrl;
        if (args.bio !== undefined) updateData["bio"] = args.bio;
        if (args.avatar !== undefined) updateData["avatar"] = args.avatar;
        if (args.userId !== undefined) updateData["userId"] = args.userId;
        if (args.socials) updateData["socials"] = args.socials;
        if (args.metadata) updateData["metadata"] = args.metadata;

        const updated = await db
          .update(bylines)
          .set(updateData)
          .where(eq(bylines.id, args.id))
          .returning();
        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: JSON.stringify(updated[0] || null, null, 2) }],
          },
        };
      }

      case "cms_delete_byline": {
        const deleted = await db
          .update(bylines)
          .set({ deletedAt: new Date() })
          .where(eq(bylines.id, args.id))
          .returning();
        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify({ success: true, byline: deleted[0] || null }, null, 2),
              },
            ],
          },
        };
      }

      // ─── Dynamic Content Types & E-Commerce ───────────────────────────────────
      case "cms_list_content_types": {
        const rows = await db.select().from(contentTypes).orderBy(desc(contentTypes.createdAt));
        return {
          jsonrpc: "2.0",
          id,
          result: { content: [{ type: "text", text: JSON.stringify(rows, null, 2) }] },
        };
      }

      case "cms_get_content_type": {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          args.slugOrId,
        );
        const condition = isUuid
          ? eq(contentTypes.id, args.slugOrId)
          : eq(contentTypes.slug, args.slugOrId);
        const row = await db.select().from(contentTypes).where(condition).limit(1);

        return {
          jsonrpc: "2.0",
          id,
          result: { content: [{ type: "text", text: JSON.stringify(row[0] || null, null, 2) }] },
        };
      }

      case "cms_create_content_type": {
        const namePayload = typeof args.name === "string" ? { en: args.name } : args.name;
        const descPayload =
          typeof args.description === "string"
            ? { en: args.description }
            : args.description || null;

        const row = await db
          .insert(contentTypes)
          .values({
            slug: args.slug,
            name: namePayload,
            description: descPayload,
            icon: args.icon || "i-lucide-box",
            mode: args.mode || "document",
            fieldSchema: args.fieldSchema || {},
            ecomSettings: args.ecomSettings || null,
            initialBlocks: args.initialBlocks || [],
            isSystem: Boolean(args.isSystem),
          })
          .returning();

        return {
          jsonrpc: "2.0",
          id,
          result: { content: [{ type: "text", text: JSON.stringify(row[0], null, 2) }] },
        };
      }

      case "cms_update_content_type": {
        const updateData: Record<string, any> = { updatedAt: new Date() };
        if (args.slug) updateData["slug"] = args.slug;
        if (args.name)
          updateData["name"] = typeof args.name === "string" ? { en: args.name } : args.name;
        if (args.description !== undefined) {
          updateData["description"] =
            typeof args.description === "string" ? { en: args.description } : args.description;
        }
        if (args.icon) updateData["icon"] = args.icon;
        if (args.mode) updateData["mode"] = args.mode;
        if (args.fieldSchema) updateData["fieldSchema"] = args.fieldSchema;
        if (args.ecomSettings !== undefined) updateData["ecomSettings"] = args.ecomSettings;
        if (args.initialBlocks) updateData["initialBlocks"] = args.initialBlocks;

        const updated = await db
          .update(contentTypes)
          .set(updateData)
          .where(eq(contentTypes.id, args.id))
          .returning();
        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: JSON.stringify(updated[0] || null, null, 2) }],
          },
        };
      }

      case "cms_delete_content_type": {
        const deleted = await db
          .delete(contentTypes)
          .where(eq(contentTypes.id, args.id))
          .returning();
        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify({ success: true, contentType: deleted[0] || null }, null, 2),
              },
            ],
          },
        };
      }

      // ─── Site Settings ────────────────────────────────────────────────────────
      case "cms_get_site_settings": {
        const settings = await getSiteSettings(db);
        return {
          jsonrpc: "2.0",
          id,
          result: { content: [{ type: "text", text: JSON.stringify(settings, null, 2) }] },
        };
      }

      case "cms_update_site_settings": {
        const updated = await updateSiteSettings(db, args);
        return {
          jsonrpc: "2.0",
          id,
          result: { content: [{ type: "text", text: JSON.stringify(updated, null, 2) }] },
        };
      }

      // ─── Search ───────────────────────────────────────────────────────────────
      case "cms_search_content": {
        const queryLimit = typeof args.limit === "number" ? args.limit : 10;
        const conditions = [isNull(pages.deletedAt)];
        if (args.type) {
          conditions.push(eq(pages.type, args.type as PageType));
        }

        const rows = await db
          .select({
            id: pages.id,
            slug: pages.slug,
            type: pages.type,
            title: pages.title,
            description: pages.description,
            postedAt: pages.postedAt,
          })
          .from(pages)
          .where(
            and(
              ...conditions,
              or(
                like(pages.slug, `%${args.query}%`),
                sql`CAST(${pages.title} AS TEXT) ILIKE ${`%${args.query}%`}`,
              ),
            ),
          )
          .limit(queryLimit);

        return {
          jsonrpc: "2.0",
          id,
          result: { content: [{ type: "text", text: JSON.stringify(rows, null, 2) }] },
        };
      }

      default:
        return {
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: `Method or tool '${name}' not found` },
        };
    }
  }

  return {
    jsonrpc: "2.0",
    id,
    error: { code: -32601, message: `Unknown method: ${method}` },
  };
}
