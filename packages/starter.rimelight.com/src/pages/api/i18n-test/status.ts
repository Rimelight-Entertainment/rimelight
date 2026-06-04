import type { APIRoute } from "astro"
import { env } from "cloudflare:workers"

export const GET: APIRoute = async () => {
  let hasKvBinding = false
  let kvReachable = false

  const kv = env.TRANSLATIONS_KV
  hasKvBinding = !!kv
  if (kv) {
    try {
      await kv.get("locale:en:app_header", "json")
      kvReachable = true
    } catch {
      kvReachable = false
    }
  }

  return new Response(
    JSON.stringify(
      {
        mode: hasKvBinding ? "kv" : "static",
        kvBinding: hasKvBinding ? "TRANSLATIONS_KV" : null,
        kvReachable,
        message: hasKvBinding
          ? "KV binding detected — translations hydrate from KV with bundled JSON fallback"
          : "No KV binding — translations served from bundled static JSON",
        translationSource: hasKvBinding ? "KV (falls back to bundled JSON)" : "Bundled static JSON",
        locales: ["en", "es", "pt"]
      },
      null,
      2
    ),
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    }
  )
}
