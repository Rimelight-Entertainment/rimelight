import type { APIRoute } from "astro"
import { env } from "cloudflare:workers"
import en from "../../../translations/en.json"
import es from "../../../translations/es.json"
import pt from "../../../translations/pt.json"

export const POST: APIRoute = async ({ request }) => {
  const kv = env.TRANSLATIONS_KV

  if (!kv) {
    return new Response(
      JSON.stringify({
        error: "TRANSLATIONS_KV binding not available. Add it to wrangler.jsonc and deploy."
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }

  let localesToSeed: string[] = ["en", "es", "pt"]
  try {
    const body = await request.json()
    if (body && typeof body === "object" && "locales" in body) {
      const obj = body as { locales: unknown }
      if (Array.isArray(obj.locales)) {
        localesToSeed = obj.locales.map(String)
      }
    }
  } catch {}

  const localeMap: Record<string, Record<string, Record<string, string>>> = { en, es, pt }
  const results: Record<string, { components: string[]; keys: number }> = {}
  const promises: Promise<void>[] = []

  for (const locale of localesToSeed) {
    const data = localeMap[locale]
    if (!data) {
      results[locale] = { components: [], keys: 0 }
      continue
    }

    const components = Object.keys(data)
    const resultObj = { components, keys: 0 }
    results[locale] = resultObj

    for (const name of components) {
      const key = `locale:${locale}:${name}`
      const componentData = data[name]
      if (componentData && typeof componentData === "object") {
        promises.push(
          kv.put(key, JSON.stringify(componentData)).then(() => {
            resultObj.keys += Object.keys(componentData).length
          })
        )
      }
    }
  }

  await Promise.all(promises)

  return new Response(
    JSON.stringify(
      {
        seeded: results,
        message: "KV seeded successfully. Translations will now hydrate from KV."
      },
      null,
      2
    ),
    {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    }
  )
}
