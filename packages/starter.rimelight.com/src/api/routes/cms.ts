import { Hono } from "hono"
import { auth } from "@/auth/auth"
import { db } from "@/db"
import {
  pages,
  pageDrafts,
  pageDraftLocks,
  pageTemplates,
  pageVersions,
  pageVersionApprovals
} from "@/db/schema"
import { eq, and, desc, isNull } from "drizzle-orm"
import { validateServerBlockPayload } from "@rimelight/cms"

const cms = new Hono()

async function checkApprovalRequirements(pageId: string, userId: string, userRoles: string[]) {
  // Get the page to check its template
  const page = await db.select().from(pages).where(eq(pages.id, pageId)).limit(1)
  if (!page[0] || !page[0].templateId) {
    // No template = no approval requirements
    return { canPublish: true, reason: null }
  }

  // Get template approval rules
  const template = await db
    .select()
    .from(pageTemplates)
    .where(eq(pageTemplates.id, page[0].templateId))
    .limit(1)
  if (!template[0]) {
    return { canPublish: true, reason: null }
  }

  const approvalRules = template[0].approvalRules || { allowSelfApproval: true, minApprovals: 1 }
  const minApprovals = approvalRules.minApprovals ?? 1

  // Get existing approvals for this page's latest pending version
  const lastVersion = await db
    .select()
    .from(pageVersions)
    .where(eq(pageVersions.pageId, pageId))
    .orderBy(desc(pageVersions.versionNumber))
    .limit(1)

  let existingApprovals: any[] = []
  if (lastVersion[0]) {
    existingApprovals = await db
      .select()
      .from(pageVersionApprovals)
      .where(eq(pageVersionApprovals.versionId, lastVersion[0].id))
      .limit(10)
  }

  // Check if user has required role for approval
  if (approvalRules.requiredRolesForApproval && approvalRules.requiredRolesForApproval.length > 0) {
    const hasRequiredRole = userRoles.some((role) =>
      approvalRules.requiredRolesForApproval!.includes(role)
    )
    if (!hasRequiredRole) {
      return { canPublish: false, reason: "User does not have required role for approval" }
    }
  }

  // Check self-approval restriction
  const userAlreadyApproved = existingApprovals.some((a) => a.userId === userId)
  if (!approvalRules.allowSelfApproval && userAlreadyApproved) {
    // Need at least one other approval
    const otherApprovals = existingApprovals.filter((a) => a.userId !== userId)
    if (otherApprovals.length < minApprovals) {
      return {
        canPublish: false,
        reason: `Self-approval not allowed. Need ${minApprovals} distinct approvers.`
      }
    }
  }

  // Check minimum approval count
  const effectiveApprovals = approvalRules.allowSelfApproval
    ? existingApprovals.length
    : existingApprovals.filter((a) => a.userId !== userId).length

  if (effectiveApprovals < minApprovals) {
    return {
      canPublish: false,
      reason: `Need ${minApprovals} approvals, currently have ${effectiveApprovals}`
    }
  }

  return { canPublish: true, reason: null }
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

// Versions
cms.get("/versions", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const versionsList = await db
    .select()
    .from(pageVersions)
    .orderBy(desc(pageVersions.createdAt))
    .limit(50)

  // Join with pages to get page title/slug
  const versionsWithPage = await Promise.all(
    versionsList.map(async (version) => {
      const page = await db
        .select({ title: pages.title, slug: pages.slug })
        .from(pages)
        .where(eq(pages.id, version.pageId))
        .limit(1)
      return {
        ...version,
        pageTitle: page[0]?.title || "Unknown Page",
        slug: page[0]?.slug || ""
      }
    })
  )

  return c.json({ versions: versionsWithPage })
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

  // Ensure content is returned as an object, not a string
  const pagesData = pagesList.map((page) => ({
    ...page,
    content: typeof page.content === "string" ? JSON.parse(page.content) : page.content
  }))

  return c.json({ pages: pagesData })
})

cms.get("/pages/:id", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")
  const page = await db.select().from(pages).where(eq(pages.id, id)).limit(1)

  if (!page[0]) return c.json({ error: "Page not found" }, 404)

  const draft = await db.select().from(pageDrafts).where(eq(pageDrafts.pageId, id)).limit(1)

  // Ensure content is returned as an object, not a string
  const pageData = {
    ...page[0],
    content: typeof page[0].content === "string" ? JSON.parse(page[0].content) : page[0].content
  }

  const draftData = draft[0]
    ? {
        ...draft[0],
        content:
          typeof draft[0].content === "string" ? JSON.parse(draft[0].content) : draft[0].content
      }
    : null

  return c.json({ page: pageData, draft: draftData })
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
    const existingContent =
      typeof existingPage[0].content === "string"
        ? JSON.parse(existingPage[0].content)
        : existingPage[0].content
    const incomingContent =
      typeof body.content === "string" ? JSON.parse(body.content) : body.content

    const validation = validateServerBlockPayload(
      existingContent.blocks || [],
      incomingContent.blocks || []
    )
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
    const existingContent =
      typeof existingPage[0].content === "string"
        ? JSON.parse(existingPage[0].content)
        : existingPage[0].content
    const incomingContent =
      typeof body.content === "string" ? JSON.parse(body.content) : body.content

    const validation = validateServerBlockPayload(
      existingContent.blocks || [],
      incomingContent.blocks || []
    )
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

  // Check approval requirements
  const userRoles = session.user.role ? [session.user.role] : []
  const approvalCheck = await checkApprovalRequirements(id, session.user.id, userRoles)
  if (!approvalCheck.canPublish) {
    return c.json({ error: approvalCheck.reason }, 403)
  }

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

  // Record this approval
  await db.insert(pageVersionApprovals).values({
    versionId: version[0].id,
    userId: session.user.id,
    userRole: session.user.role || "member",
    approvedAt: new Date()
  })

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

// Approvals
cms.post("/versions/:versionId/approve", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const versionId = c.req.param("versionId")

  // Check if version exists
  const version = await db
    .select()
    .from(pageVersions)
    .where(eq(pageVersions.id, versionId))
    .limit(1)
  if (!version[0]) return c.json({ error: "Version not found" }, 404)

  // Check if user already approved
  const existingApproval = await db
    .select()
    .from(pageVersionApprovals)
    .where(
      and(
        eq(pageVersionApprovals.versionId, versionId),
        eq(pageVersionApprovals.userId, session.user.id)
      )
    )
    .limit(1)

  if (existingApproval[0]) {
    return c.json({ error: "Already approved" }, 400)
  }

  // Add approval
  await db.insert(pageVersionApprovals).values({
    versionId,
    userId: session.user.id,
    userRole: session.user.role || "member",
    approvedAt: new Date()
  })

  // Update version's approvedBy array
  const allApprovals = await db
    .select()
    .from(pageVersionApprovals)
    .where(eq(pageVersionApprovals.versionId, versionId))

  await db
    .update(pageVersions)
    .set({
      approvedBy: allApprovals.map((a) => a.userId),
      approvedAt: new Date()
    })
    .where(eq(pageVersions.id, versionId))

  return c.json({ success: true })
})

export default cms
