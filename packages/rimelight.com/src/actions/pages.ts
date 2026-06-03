import { defineAction, ActionError } from "astro:actions"
import { z } from "astro/zod"
import { db } from "@/db"
import { pages, pageVersions, searchIndex } from "@/db/schema"
import { and, asc, desc, eq, isNotNull, isNull, sql } from "drizzle-orm"
import { type Block, type PageType, type Localized, type Page } from "@/types/pages"
import { PAGE_MAP } from "@/types/pageDefinitions"

function extractTextFromBlocks(blocks: Block[]): string {
  if (!blocks || !Array.isArray(blocks)) return ""
  let text = ""
  for (const block of blocks) {
    if (!block) continue
    if (block.type === "SectionBlock") {
      text += ` ${block.props.title || ""} ${block.props.description || ""}`
      if (block.props.children) {
        text += ` ${extractTextFromBlocks(block.props.children)}`
      }
    } else if (block.type === "ParagraphBlock") {
      if (Array.isArray(block.props.text)) {
        for (const item of block.props.text) {
          if (item && (item.type === "text" || item.type === "link")) {
            text += ` ${item.props.content || ""}`
          }
        }
      }
    } else if (block.type === "CalloutBlock") {
      if (block.props.children) {
        text += ` ${extractTextFromBlocks(block.props.children)}`
      }
    } else if (block.type === "ImageBlock") {
      text += ` ${block.props.alt || ""} ${block.props.caption || ""}`
    }
  }
  return text.trim()
}

async function indexDatabasePage(page: {
  id: string
  slug: string
  title: Localized
  description?: Localized | null
  content: { blocks: Block[] }
}) {
  const titleObj = page.title
  const title = titleObj?.en || Object.values(titleObj || {})[0] || "Untitled Page"

  const descObj = page.description
  const description = descObj?.en || Object.values(descObj || {})[0] || ""

  const bodyContent = `${description} ${extractTextFromBlocks(page.content?.blocks || [])}`.trim()
  const url = `/${page.slug}`

  await db
    .insert(searchIndex)
    .values({
      sourceType: "database_page",
      sourceId: page.id,
      title,
      url,
      bodyContent,
      searchableText: sql`setweight(to_tsvector('english', ${title}), 'A') || setweight(to_tsvector('english', ${bodyContent}), 'B')`,
      updatedAt: new Date()
    })
    .onConflictDoUpdate({
      target: [searchIndex.sourceType, searchIndex.sourceId],
      set: {
        title,
        url,
        bodyContent,
        searchableText: sql`setweight(to_tsvector('english', ${title}), 'A') || setweight(to_tsvector('english', ${bodyContent}), 'B')`,
        updatedAt: new Date()
      }
    })
}

async function deindexDatabasePage(id: string) {
  await db
    .delete(searchIndex)
    .where(and(eq(searchIndex.sourceType, "database_page"), eq(searchIndex.sourceId, id)))
}

function getRole(user: unknown): string | undefined {
  if (!user || typeof user !== "object") return undefined
  if ("role" in user) {
    return typeof user.role === "string" ? user.role : undefined
  }
  return undefined
}

function toLocalized(val: string | Record<string, string>): Localized {
  return typeof val === "string" ? { en: val } : val
}

function toLocalizedOptional(
  val: string | Record<string, string> | undefined
): Localized | undefined {
  return val ? toLocalized(val) : undefined
}

function checkOwnerOrMember(context: any) {
  const user = context.locals.user
  const role = getRole(user)
  const isAuthorized = role === "owner" || role === "member"
  if (!isAuthorized) {
    throw new ActionError({
      code: "UNAUTHORIZED",
      message: "Owner or member privileges required."
    })
  }
  return user
}

const localizedSchema = z.record(z.string(), z.string())

const pageTypeSchema = z
  .string()
  .refine((val): val is PageType => val in PAGE_MAP, { message: "Invalid page type" })

export const pageActions = {
  getPages: defineAction({
    input: z.object({
      limit: z.number().optional().default(10),
      offset: z.number().optional().default(0),
      type: pageTypeSchema.optional().default("Default"),
      status: z.enum(["published", "draft"]).optional(),
      orderBy: z.enum(["title", "postedAt", "createdAt"]).optional().default("postedAt"),
      order: z.enum(["asc", "desc"]).optional().default("desc")
    }),
    handler: async (input, context) => {
      const { limit, offset, type, status, orderBy: orderByField, order: orderDirection } = input
      const user = context.locals.user
      const role = getRole(user)
      const isAuthorized = role === "owner" || role === "member"

      if (status === "draft" && !isAuthorized) {
        throw new ActionError({
          code: "FORBIDDEN",
          message: "Unauthorized to view drafts"
        })
      }

      const filters = [eq(pages.type, type), isNull(pages.deletedAt)]

      if (status === "published") {
        filters.push(isNotNull(pages.postedAt))
      } else if (status === "draft") {
        filters.push(isNull(pages.postedAt))
      }

      const orderFn = orderDirection === "asc" ? asc : desc
      const orderByColumn =
        orderByField === "title"
          ? pages.title
          : orderByField === "createdAt"
            ? pages.createdAt
            : pages.postedAt

      try {
        const results = await db.query.pages.findMany({
          where: and(...filters),
          orderBy: [orderFn(orderByColumn)],
          limit,
          offset
        })

        return results.map((row) =>
          Object.assign({}, row, {
            blocks: row.content?.blocks || [],
            properties: row.content?.properties || {}
          })
        ) as Page[]
      } catch (error) {
        console.error("Pages API Error:", error)
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch pages"
        })
      }
    }
  }),

  createPage: defineAction({
    input: z.object({
      type: pageTypeSchema,
      slug: z.string(),
      title: z.string().or(localizedSchema),
      description: z.string().or(localizedSchema).optional(),
      tags: z.array(z.string().or(localizedSchema)).optional(),
      properties: z.record(z.string(), z.any()).optional(),
      blocks: z.array(z.any()).optional()
    }),
    handler: async (input, context) => {
      const user = checkOwnerOrMember(context)

      const newPage: typeof pages.$inferInsert = {
        type: input.type,
        slug: input.slug,
        title: toLocalized(input.title),
        description: toLocalizedOptional(input.description),
        tags: input.tags?.map(toLocalized) ?? [],
        authorIds: [user.id],
        content: {
          properties: input.properties || {},
          blocks: input.blocks || []
        }
      }

      try {
        const result = await db.insert(pages).values(newPage).returning()
        const inserted = result[0]

        if (!inserted) {
          throw new ActionError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database failed to return the created record."
          })
        }

        return {
          ...inserted,
          blocks: inserted.content.blocks,
          properties: inserted.content.properties
        }
      } catch (error) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to create page"
        })
      }
    }
  }),

  updatePage: defineAction({
    input: z.object({
      id: z.string(),
      slug: z.string().optional(),
      title: z.string().or(localizedSchema).optional(),
      description: z.string().or(localizedSchema).optional(),
      tags: z.array(z.string().or(localizedSchema)).optional(),
      authorIds: z.array(z.string()).optional(),
      properties: z.record(z.string(), z.any()).optional(),
      blocks: z.array(z.any()).optional(),
      postedAt: z.string().or(z.date()).optional()
    }),
    handler: async (input, context) => {
      const user = checkOwnerOrMember(context)
      const { id, ...body } = input

      const [existingPage] = await db.select().from(pages).where(eq(pages.id, id)).limit(1)

      if (!existingPage) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Page not found"
        })
      }

      const versionData: typeof pageVersions.$inferInsert = {
        pageId: id,
        status: "pending" as const,
        slug: body.slug || existingPage.slug,
        type: existingPage.type,
        title: toLocalized(body.title || existingPage.title),
        description: toLocalizedOptional(body.description ?? existingPage.description ?? undefined),
        tags: (body.tags ? body.tags.map(toLocalized) : existingPage.tags) ?? [],
        authorIds: body.authorIds || [],
        content: {
          properties: body.properties || {},
          blocks: body.blocks || []
        },
        postedAt: body.postedAt ? new Date(body.postedAt) : null,
        createdBy: user.id
      }

      try {
        const [newVersion] = await db.insert(pageVersions).values(versionData).returning()

        if (!newVersion) {
          throw new ActionError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create page version"
          })
        }

        return {
          ...newVersion,
          blocks: newVersion.content.blocks,
          properties: newVersion.content.properties,
          message: "Page changes saved as a new version pending approval"
        }
      } catch (error) {
        console.error("Version Creation Error:", error)
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to create page version"
        })
      }
    }
  }),

  deletePage: defineAction({
    input: z.object({
      id: z.string()
    }),
    handler: async (input, context) => {
      checkOwnerOrMember(context)

      const [deleted] = await db
        .update(pages)
        .set({ deletedAt: new Date() })
        .where(eq(pages.id, input.id))
        .returning()

      if (!deleted) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Page not found"
        })
      }

      await deindexDatabasePage(input.id)

      return { success: true }
    }
  }),

  publishPage: defineAction({
    input: z.object({
      id: z.string()
    }),
    handler: async (input, context) => {
      checkOwnerOrMember(context)

      const [published] = await db
        .update(pages)
        .set({ postedAt: new Date() })
        .where(eq(pages.id, input.id))
        .returning()

      if (!published) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Page not found"
        })
      }

      await indexDatabasePage(published)

      return { success: true }
    }
  }),

  unpublishPage: defineAction({
    input: z.object({
      id: z.string()
    }),
    handler: async (input, context) => {
      checkOwnerOrMember(context)

      const [unpublished] = await db
        .update(pages)
        .set({ postedAt: null })
        .where(eq(pages.id, input.id))
        .returning()

      if (!unpublished) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Page not found"
        })
      }

      await deindexDatabasePage(input.id)

      return { success: true }
    }
  }),

  approveVersion: defineAction({
    input: z.object({
      versionId: z.string()
    }),
    handler: async (input, context) => {
      const user = checkOwnerOrMember(context)

      const [version] = await db
        .select()
        .from(pageVersions)
        .where(eq(pageVersions.id, input.versionId))
        .limit(1)

      if (!version) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Version not found"
        })
      }

      const [updatedVersion] = await db
        .update(pageVersions)
        .set({
          status: "approved",
          approvedBy: user.id,
          approvedAt: new Date()
        })
        .where(eq(pageVersions.id, input.versionId))
        .returning()

      await db
        .update(pages)
        .set({
          title: version.title,
          description: version.description,
          tags: version.tags,
          authorIds: version.authorIds,
          content: version.content,
          postedAt: version.postedAt
        })
        .where(eq(pages.id, version.pageId))

      if (version.postedAt) {
        await indexDatabasePage({
          id: version.pageId,
          slug: version.slug,
          title: version.title,
          description: version.description,
          content: version.content
        })
      } else {
        await deindexDatabasePage(version.pageId)
      }

      return updatedVersion
    }
  }),

  rejectVersion: defineAction({
    input: z.object({
      versionId: z.string()
    }),
    handler: async (input, context) => {
      checkOwnerOrMember(context)

      const [updatedVersion] = await db
        .update(pageVersions)
        .set({ status: "rejected" })
        .where(eq(pageVersions.id, input.versionId))
        .returning()

      if (!updatedVersion) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Version not found"
        })
      }

      return updatedVersion
    }
  })
}
