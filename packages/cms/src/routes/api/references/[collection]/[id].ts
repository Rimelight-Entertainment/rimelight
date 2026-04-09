/* eslint-disable no-await-in-loop */
import type { APIRoute } from "astro"
import config from "@/cms/cms.config"
import { cms } from "@/generated/api"
import { getLabelField } from "@/core/define"

export const prerender = false

// Safe runtime access to CMS collections
const cmsRuntime = cms as unknown as Record<
  string,
  {
    find: (options?: Record<string, unknown>) => Promise<Array<Record<string, unknown>>>
    count: (options?: Record<string, unknown>) => Promise<number>
  }
>

export const GET: APIRoute = async ({ params }) => {
  const { collection: collectionSlug, id: documentId } = params
  if (!collectionSlug || !documentId) {
    return Response.json({ refs: [] })
  }

  const collection = config.collections.find((c) => c.slug === collectionSlug)
  if (!collection) return Response.json({ refs: [] })

  const refs: Array<{ collection: string; label: string; count: number }> = []

  for (const otherCollection of config.collections) {
    if (otherCollection.slug === collectionSlug) continue

    const allFieldEntries = Object.entries(otherCollection.fields)
    const relationFields = allFieldEntries.filter(
      ([, f]) =>
        f.type === "relation" && (f as { collection?: string }).collection === collectionSlug
    ) as Array<[string, { collection: string; hasMany?: boolean }]>

    if (relationFields.length === 0) continue

    const otherApi = cmsRuntime[otherCollection.slug]
    if (!otherApi || typeof otherApi.find !== "function" || typeof otherApi.count !== "function")
      continue

    for (const [fieldName, field] of relationFields) {
      try {
        const isMany = field.hasMany ?? false
        let count = 0

        if (isMany) {
          const allDocs = await otherApi.find({ status: "any", limit: 200 })
          count = allDocs.filter((r: Record<string, unknown>) => {
            const val = r[fieldName]
            if (Array.isArray(val)) return val.includes(documentId)
            if (typeof val === "string") return val.includes(documentId)
            return false
          }).length
        } else {
          count = await otherApi.count({ status: "any", where: { [fieldName]: documentId } })
        }

        if (count > 0) {
          refs.push({
            collection: otherCollection.labels.plural,
            label: getLabelField(otherCollection),
            count
          })
        }
      } catch {}
    }
  }

  return Response.json({ refs, total: refs.reduce((sum, r) => sum + r.count, 0) })
}
