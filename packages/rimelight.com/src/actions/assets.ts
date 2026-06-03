import { defineAction, ActionError } from "astro:actions"

interface CloudflareEnv {
  BLOB: R2Bucket
  R2: R2Bucket
}

function getCloudflareEnv(
  locals: App.Locals & { runtime?: { env: CloudflareEnv } }
): CloudflareEnv | undefined {
  return locals.runtime?.env
}

async function listAll(
  BLOB: {
    list(opts?: {
      cursor?: string
    }): Promise<{ objects: any[]; truncated: boolean; cursor?: string }>
  },
  cursor?: string
): Promise<any[]> {
  const list = await BLOB.list(cursor ? { cursor } : undefined)
  if (!list.truncated) return list.objects
  return list.objects.concat(await listAll(BLOB, list.cursor))
}

export const assets = {
  getAssets: defineAction({
    handler: async (_input, context) => {
      const user = context.locals.user
      if (!user) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "Authentication required."
        })
      }

      const cloudflareEnv = getCloudflareEnv(context.locals)
      const BLOB = cloudflareEnv?.BLOB

      if (!BLOB) {
        // Safe fallback for local development or non-Cloudflare platforms
        console.warn("[R2 Assets] Cloudflare R2 bucket (BLOB) not bound. Returning empty list.")
        return []
      }

      try {
        const allObjects = await listAll(BLOB)

        const uniqueObjectsMap = new Map()
        allObjects.forEach((obj) => {
          uniqueObjectsMap.set(obj.key, obj)
        })

        return Array.from(uniqueObjectsMap.values()).map((obj: any) => ({
          key: obj.key,
          size: obj.size,
          uploaded: obj.uploaded,
          contentType: obj.httpMetadata?.contentType,
          etag: obj.httpEtag
        }))
      } catch (error) {
        console.error("Failed to fetch R2 assets:", error)
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to list R2 assets."
        })
      }
    }
  })
}
