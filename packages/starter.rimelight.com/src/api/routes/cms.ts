import { Hono } from "hono"
import { auth } from "@/auth/auth"
import { db } from "@/db"
import { pages, pageDrafts, pageDraftLocks, pageTemplates, pageVersions } from "@/db/schema"
import { eq, desc, isNull } from "drizzle-orm"
import type { BaseBlock } from "@rimelight/cms"

const cms = new Hono()

function validateServerBlockPayload(
  existingContent: any,
  incomingContent: any
): { valid: boolean; reason?: string } {
  const existingTree = existingContent.blocks || []
  const incomingTree = incomingContent.blocks || []
  const existingTemplated = extractTemplatedBlocks(existingTree)
  const incomingTemplated = extractTemplatedBlocks(incomingTree)

  if (existingTemplated.length !== incomingTemplated.length) {
    return { valid: false, reason: "Forbidden: One or more templated blocks were removed." }
  }

  for (const existingBlock of existingTemplated) {
    const incomingBlock = incomingTemplated.find(
      (b) => b.type === existingBlock.type && b.id === existingBlock.id
    )
    if (!incomingBlock) {
      return {
        valid: false,
        reason: `Forbidden: Templated block ${existingBlock.type} (ID: ${existingBlock.id}) missing in payload.`
      }
    }

    if (existingBlock.templatedProps === true) {
      if (JSON.stringify(existingBlock.props) !== JSON.stringify(incomingBlock.props)) {
        return {
          valid: false,
          reason: `Forbidden: Cannot modify locked properties on ${existingBlock.type}.`
        }
      }
    } else if (Array.isArray(existingBlock.templatedProps)) {
      for (const key of existingBlock.templatedProps) {
        if (JSON.stringify(existingBlock.props[key]) !== JSON.stringify(incomingBlock.props[key])) {
          return {
            valid: false,
            reason: `Forbidden: Cannot modify locked property '${key}' on ${existingBlock.type}.`
          }
        }
      }
    }
  }

  return { valid: true }
}

function extractTemplatedBlocks(blocks: BaseBlock[]): BaseBlock[] {
  let result: BaseBlock[] = []
  for (const b of blocks) {
    if (b.isTemplated) result.push(b)
    if (b.children?.length) result = result.concat(extractTemplatedBlocks(b.children))
  }
  return result
}

// Templates
cms.get("/templates", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const templates = await db.select().from(pageTemplates).orderBy(desc(pageTemplates.createdAt))
  return c.json({ templates })
})

cms.post("/templates", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const body = await c.req.json()
  const template = await db
    .insert(pageTemplates)
    .values({
      ...body,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning()

  return c.json({ template: template[0] })
})

cms.put("/templates/:id", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")
  const body = await c.req.json()

  const template = await db
    .update(pageTemplates)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(pageTemplates.id, id))
    .returning()

  return c.json({ template: template[0] })
})

cms.delete("/templates/:id", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")
  await db.delete(pageTemplates).where(eq(pageTemplates.id, id))

  return c.json({ success: true })
})

// Pages
cms.get("/pages", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const pagesList = await db
    .select()
    .from(pages)
    .where(isNull(pages.deletedAt))
    .orderBy(desc(pages.createdAt))

  return c.json({ pages: pagesList })
})

cms.get("/pages/:id", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")
  const page = await db.select().from(pages).where(eq(pages.id, id)).limit(1)

  if (!page[0]) return c.json({ error: "Page not found" }, 404)

  const draft = await db.select().from(pageDrafts).where(eq(pageDrafts.pageId, id)).limit(1)

  return c.json({ page: page[0], draft: draft[0] })
})

cms.post("/pages", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const body = await c.req.json()
  const page = await db
    .insert(pages)
    .values({
      ...body,
      authorIds: [session.user.id],
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning()

  if (!page[0]) return c.json({ error: "Failed to create page" }, 500)

  // Create initial draft
  await db.insert(pageDrafts).values({
    pageId: page[0].id,
    content: body.content,
    updatedBy: session.user.id,
    updatedAt: new Date()
  })

  return c.json({ page: page[0] })
})

cms.put("/pages/:id", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")
  const body = await c.req.json()

  const existingPage = await db.select().from(pages).where(eq(pages.id, id)).limit(1)
  if (!existingPage[0]) return c.json({ error: "Page not found" }, 404)

  // Validate block changes
  if (body.content?.blocks) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const validation = validateServerBlockPayload(existingPage[0].content, body.content)
    if (!validation.valid) {
      return c.json({ error: validation.reason }, 403)
    }
  }

  const page = await db
    .update(pages)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(pages.id, id))
    .returning()

  return c.json({ page: page[0] })
})

cms.delete("/pages/:id", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")
  await db.update(pages).set({ deletedAt: new Date() }).where(eq(pages.id, id))

  return c.json({ success: true })
})

// Drafts
cms.post("/pages/:id/draft", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")
  const body = await c.req.json()

  const existingPage = await db.select().from(pages).where(eq(pages.id, id)).limit(1)
  if (!existingPage[0]) return c.json({ error: "Page not found" }, 404)

  // Validate block changes
  if (body.content?.blocks) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const validation = validateServerBlockPayload(existingPage[0].content, body.content)
    if (!validation.valid) {
      return c.json({ error: validation.reason }, 403)
    }
  }

  await db
    .insert(pageDrafts)
    .values({
      pageId: id,
      content: body.content,
      updatedBy: session.user.id,
      updatedAt: new Date()
    })
    .onConflictDoUpdate({
      target: pageDrafts.pageId,
      set: {
        content: body.content,
        updatedBy: session.user.id,
        updatedAt: new Date()
      }
    })

  return c.json({ success: true })
})

// Draft Locks
cms.post("/pages/:id/lock/checkout", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")

  const existingLock = await db
    .select()
    .from(pageDraftLocks)
    .where(eq(pageDraftLocks.pageId, id))
    .limit(1)

  if (existingLock[0]) {
    const isExpired = new Date(existingLock[0].expiresAt) < new Date()
    if (!isExpired) {
      return c.json({
        success: false,
        lockedByUserId: existingLock[0].lockedByUserId,
        lockedByUserName: existingLock[0].lockedByUserName,
        expiresAt: existingLock[0].expiresAt
      })
    }
  }

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

  await db
    .insert(pageDraftLocks)
    .values({
      pageId: id,
      lockedByUserId: session.user.id,
      lockedByUserName: session.user.name,
      acquiredAt: new Date(),
      expiresAt
    })
    .onConflictDoUpdate({
      target: pageDraftLocks.pageId,
      set: {
        lockedByUserId: session.user.id,
        lockedByUserName: session.user.name,
        acquiredAt: new Date(),
        expiresAt
      }
    })

  return c.json({ success: true })
})

cms.post("/pages/:id/lock/heartbeat", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

  await db.update(pageDraftLocks).set({ expiresAt }).where(eq(pageDraftLocks.pageId, id))

  return c.json({ success: true })
})

cms.post("/pages/:id/lock/release", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")
  await db.delete(pageDraftLocks).where(eq(pageDraftLocks.pageId, id))

  return c.json({ success: true })
})

// Versions
cms.post("/pages/:id/publish", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")
  const body = await c.req.json()

  const page = await db.select().from(pages).where(eq(pages.id, id)).limit(1)
  if (!page[0]) return c.json({ error: "Page not found" }, 404)

  // Get current version number
  const lastVersion = await db
    .select()
    .from(pageVersions)
    .where(eq(pageVersions.pageId, id))
    .orderBy(desc(pageVersions.versionNumber))
    .limit(1)

  const nextVersionNumber = (lastVersion[0]?.versionNumber || 0) + 1

  // Create new version
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
      createdBy: session.user.id,
      approvedBy: [session.user.id],
      approvedAt: new Date(),
      changeSummary: body.changeSummary,
      createdAt: new Date()
    })
    .returning()

  if (!version[0]) return c.json({ error: "Failed to create version" }, 500)

  // Update page with published version
  await db
    .update(pages)
    .set({
      content: body.content,
      publishedVersionId: version[0].id,
      postedAt: new Date(),
      updatedAt: new Date()
    })
    .where(eq(pages.id, id))

  return c.json({ version: version[0] })
})

export default cms
