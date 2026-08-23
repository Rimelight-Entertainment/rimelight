import { and, desc, eq, isNotNull, isNull } from "drizzle-orm"
import { pages } from "../schema/pages.ts"
import { pageDrafts } from "../schema/page_drafts.ts"
import { getSiteSettings, updateSiteSettings } from "../services/site-settings.ts"
import type { PageType } from "../core/types/pages.ts"
import type { BaseBlock } from "../core/types/blocks.ts"

export const CMS_MCP_TOOLS = [
  {
    name: "cms_list_pages",
    description: "List CMS pages with optional filters for type, draft status, and pagination.",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          description: "Filter by page type (e.g. 'blog', 'docs', 'landing')"
        },
        includeDrafts: { type: "boolean", description: "Whether to include unpublished drafts" },
        limit: { type: "number", description: "Maximum number of pages to return (default 20)" }
      }
    }
  },
  {
    name: "cms_get_page",
    description:
      "Get full details, block tree, and properties for a specific CMS page by slug or id.",
    inputSchema: {
      type: "object",
      properties: {
        slugOrId: { type: "string", description: "Page slug or UUID" }
      },
      required: ["slugOrId"]
    }
  },
  {
    name: "cms_create_draft",
    description: "Create or update a draft version for a CMS page.",
    inputSchema: {
      type: "object",
      properties: {
        pageId: { type: "string", description: "Page UUID" },
        userId: { type: "string", description: "User ID creating the draft" },
        blocks: { type: "array", description: "Array of structured CMS blocks" },
        properties: { type: "object", description: "Page properties object" }
      },
      required: ["pageId", "userId", "blocks"]
    }
  },
  {
    name: "cms_get_site_settings",
    description: "Retrieve current dynamic site settings including branding and SEO defaults.",
    inputSchema: {
      type: "object",
      properties: {}
    }
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
        seo: { type: "object" }
      }
    }
  }
]

/**
 * Handles Model Context Protocol (MCP) JSON-RPC requests for CMS tools.
 */
export async function handleCmsMcpRequest(
  body: {
    jsonrpc?: string
    id?: string | number
    method: string
    params?: any
  },
  db: any
): Promise<any> {
  const { id = 1, method, params = {} } = body

  if (method === "tools/list") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        tools: CMS_MCP_TOOLS
      }
    }
  }

  if (method === "tools/call") {
    const { name, arguments: args = {} } = params

    switch (name) {
      case "cms_list_pages": {
        const conditions = [isNull(pages.deletedAt)]
        if (args.type) {
          // eslint-disable-next-line typescript/no-unsafe-type-assertion
          conditions.push(eq(pages.type, args.type as PageType))
        }
        if (!args.includeDrafts) {
          conditions.push(isNotNull(pages.publishedVersionId))
        }

        const queryLimit = typeof args.limit === "number" ? args.limit : 20
        const rows = await db
          .select({
            id: pages.id,
            slug: pages.slug,
            type: pages.type,
            title: pages.title,
            postedAt: pages.postedAt,
            publishedVersionId: pages.publishedVersionId
          })
          .from(pages)
          .where(and(...conditions))
          .orderBy(desc(pages.postedAt))
          .limit(queryLimit)

        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: JSON.stringify(rows, null, 2) }]
          }
        }
      }

      case "cms_get_page": {
        const row = await db
          .select()
          .from(pages)
          .where(and(isNull(pages.deletedAt), eq(pages.slug, args.slugOrId)))
          .limit(1)

        const page = row[0] || null
        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: JSON.stringify(page, null, 2) }]
          }
        }
      }

      case "cms_create_draft": {
        const contentPayload = {
          blocks: args.blocks as BaseBlock[],
          properties: args.properties || {}
        }

        const draft = await db
          .insert(pageDrafts)
          .values({
            pageId: args.pageId,
            updatedBy: args.userId,
            content: contentPayload
          })
          .onConflictDoUpdate({
            target: [pageDrafts.pageId],
            set: {
              content: contentPayload,
              updatedBy: args.userId,
              updatedAt: new Date()
            }
          })
          .returning()

        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: JSON.stringify(draft[0], null, 2) }]
          }
        }
      }

      case "cms_get_site_settings": {
        const settings = await getSiteSettings(db)
        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: JSON.stringify(settings, null, 2) }]
          }
        }
      }

      case "cms_update_site_settings": {
        const updated = await updateSiteSettings(db, args)
        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: JSON.stringify(updated, null, 2) }]
          }
        }
      }

      default:
        return {
          jsonrpc: "2.0",
          id,
          error: {
            code: -32601,
            message: `Method or tool '${name}' not found`
          }
        }
    }
  }

  return {
    jsonrpc: "2.0",
    id,
    error: {
      code: -32601,
      message: `Unknown method: ${method}`
    }
  }
}
