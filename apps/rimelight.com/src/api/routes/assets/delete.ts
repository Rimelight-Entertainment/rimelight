import { Hono } from "hono"
import { env } from "cloudflare:workers"

const api = new Hono()

function requireAuth(c: any) {
  if (!c.get("user")) return c.text("Unauthorized", 401)
  return null
}

api.delete("/:key{.*}", async (c) => {
  const error = requireAuth(c)
  if (error) return error

  const key = c.req.param("key")
  if (!key) return c.text("Bad Request", 400)

  const BLOB = (env as any)?.BLOB || (c.env as any)?.BLOB
  if (!BLOB) {
    console.warn("[R2 Assets] Cloudflare R2 bucket (BLOB) not bound for DELETE.")
    return c.json({ success: true, localMock: true })
  }

  await BLOB.delete(key)
  return c.json({ success: true })
})

export default api
