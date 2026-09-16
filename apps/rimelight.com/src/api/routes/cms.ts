import { Hono } from "hono"
import { db } from "#db"
import {
  getSiteSettings,
  updateSiteSettings,
  generatePreviewToken,
  diffPageSnapshots,
  pages,
  pageDrafts,
  pageVersions,
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
  deleteByline
} from "@rimelight/cms"
import { handleCmsMcpRequest } from "@rimelight/cms/mcp"
import { auth } from "#auth/auth"
import { eq, and } from "drizzle-orm"

const cms = new Hono()

// Site Settings
cms.get("/settings", async (c) => {
  const settings = await getSiteSettings(db)
  return c.json({ settings })
})

cms.put("/settings", async (c) => {
  const session = await auth.getSession(c.req.raw)
  if (!session) return c.json({ error: "Unauthorized" }, 401)
  const isOwnerOrAdmin = (session.roles || []).some((r: string) =>
    ["owner", "admin"].includes(r.toLowerCase())
  )
  if (!isOwnerOrAdmin) return c.json({ error: "Forbidden" }, 403)

  const body = await c.req.json()
  const updated = await updateSiteSettings(db, body)
  return c.json({ settings: updated })
})

// Guest Preview Tokens
cms.post("/pages/:id/preview-token", async (c) => {
  const session = await auth.getSession(c.req.raw)
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")
  const page = await db.select().from(pages).where(eq(pages.id, id)).limit(1)
  if (!page[0]) return c.json({ error: "Page not found" }, 404)

  const secret = process.env.AUTH0_SECRET || "rimelight-preview-secret-key"
  const { token, expiresAt } = await generatePreviewToken(id, secret, 86400 * 7)

  return c.json({
    token,
    expiresAt,
    previewUrl: `/en/cms/pages/${id}/preview?token=${encodeURIComponent(token)}`
  })
})

// Visual Revision Diffs
cms.get("/pages/:id/diff", async (c) => {
  const session = await auth.getSession(c.req.raw)
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")
  const fromVersionNum = c.req.query("from")
  const toVersionNum = c.req.query("to")

  const page = await db.select().from(pages).where(eq(pages.id, id)).limit(1)
  if (!page[0]) return c.json({ error: "Page not found" }, 404)

  let fromSnapshot: any = page[0]
  if (fromVersionNum) {
    const v = await db
      .select()
      .from(pageVersions)
      .where(
        and(
          eq(pageVersions.pageId, id),
          eq(pageVersions.versionNumber, parseInt(fromVersionNum, 10))
        )
      )
      .limit(1)
    if (v[0]) fromSnapshot = v[0]
  }

  let toSnapshot: any = null
  if (toVersionNum) {
    const v = await db
      .select()
      .from(pageVersions)
      .where(
        and(eq(pageVersions.pageId, id), eq(pageVersions.versionNumber, parseInt(toVersionNum, 10)))
      )
      .limit(1)
    if (v[0]) toSnapshot = v[0]
  } else {
    const draft = await db.select().from(pageDrafts).where(eq(pageDrafts.pageId, id)).limit(1)
    toSnapshot = draft[0] ? { ...page[0], content: draft[0].content } : page[0]
  }

  const parseJson = (val: any) => (typeof val === "string" ? JSON.parse(val) : val)
  fromSnapshot = { ...fromSnapshot, content: parseJson(fromSnapshot.content) }
  toSnapshot = { ...toSnapshot, content: parseJson(toSnapshot.content) }

  const diffResult = diffPageSnapshots(fromSnapshot, toSnapshot)
  return c.json({ diff: diffResult })
})

// Taxonomies
cms.get("/taxonomies/:taxonomy/terms", async (c) => {
  const taxonomy = c.req.param("taxonomy")
  const includeCounts = c.req.query("includeCounts") !== "false"
  const terms = await getTaxonomyTerms(db, taxonomy, { includeCounts })
  return c.json(terms)
})

cms.post("/taxonomies/:taxonomy/terms", async (c) => {
  const session = await auth.getSession(c.req.raw)
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const taxonomy = c.req.param("taxonomy")
  const body = await c.req.json()
  const term = await createTerm(db, { ...body, taxonomy })
  return c.json(term, 201)
})

cms.get("/taxonomies/:taxonomy/terms/:slug", async (c) => {
  const taxonomy = c.req.param("taxonomy")
  const slug = c.req.param("slug")
  const term = await getTerm(db, taxonomy, slug)
  if (!term) return c.json({ error: "Term not found" }, 404)
  return c.json(term)
})

cms.put("/taxonomies/:taxonomy/terms/:id", async (c) => {
  const session = await auth.getSession(c.req.raw)
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")
  const body = await c.req.json()
  const updated = await updateTerm(db, id, body)
  return c.json(updated)
})

cms.delete("/taxonomies/:taxonomy/terms/:id", async (c) => {
  const session = await auth.getSession(c.req.raw)
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")
  await deleteTerm(db, id)
  return c.json({ success: true })
})

cms.get("/pages/:id/terms", async (c) => {
  const id = c.req.param("id")
  const taxonomy = c.req.query("taxonomy")
  const terms = await getEntryTerms(db, id, taxonomy)
  return c.json({ terms })
})

cms.post("/pages/:id/terms/:taxonomy", async (c) => {
  const session = await auth.getSession(c.req.raw)
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")
  const taxonomy = c.req.param("taxonomy")
  const body = await c.req.json()
  const termIds = Array.isArray(body.termIds) ? body.termIds : []

  await assignEntryTerms(db, id, taxonomy, termIds)
  return c.json({ success: true })
})

// Bylines Management
cms.get("/bylines", async (c) => {
  const allBylines = await getBylines(db)
  return c.json(allBylines)
})

cms.post("/bylines", async (c) => {
  const session = await auth.getSession(c.req.raw)
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const body = await c.req.json()
  const byline = await createByline(db, body)
  return c.json(byline, 201)
})

cms.get("/bylines/:id", async (c) => {
  const id = c.req.param("id")
  const byline = await getByline(db, id)
  if (!byline) return c.json({ error: "Byline not found" }, 404)
  return c.json(byline)
})

cms.put("/bylines/:id", async (c) => {
  const session = await auth.getSession(c.req.raw)
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")
  const body = await c.req.json()
  const updated = await updateByline(db, id, body)
  if (!updated) return c.json({ error: "Byline not found" }, 404)
  return c.json(updated)
})

cms.delete("/bylines/:id", async (c) => {
  const session = await auth.getSession(c.req.raw)
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")
  await deleteByline(db, id)
  return c.json({ success: true })
})

// MCP JSON-RPC Endpoint (Protected)
cms.post("/mcp", async (c) => {
  const authHeader = c.req.header("Authorization")
  const expectedApiKey = process.env["CMS_MCP_API_KEY"] || process.env["AUTH0_SECRET"]

  let isAuthenticated = false

  // 1. Check Bearer API key if configured
  if (authHeader && authHeader.startsWith("Bearer ") && expectedApiKey) {
    const token = authHeader.slice(7).trim()
    if (token === expectedApiKey) {
      isAuthenticated = true
    }
  }

  // 2. Check active user session
  if (!isAuthenticated) {
    const session = await auth.getSession(c.req.raw)
    if (session) {
      isAuthenticated = true
    }
  }

  if (!isAuthenticated && (expectedApiKey || process.env["NODE_ENV"] === "production")) {
    return c.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: { code: -32000, message: "Unauthorized: Invalid or missing API key / session" }
      },
      401
    )
  }

  const body = await c.req.json()
  const result = await handleCmsMcpRequest(body, db)
  return c.json(result)
})

// Unified CMS Hono Route
export default cms
