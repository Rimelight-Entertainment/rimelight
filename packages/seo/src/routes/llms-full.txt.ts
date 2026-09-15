import type { APIRoute } from "astro"
import * as siteConfigMod from "virtual:rimelight-seo/site-config"
import * as dbMod from "virtual:rimelight-seo/db"
import * as corpusMod from "virtual:rimelight-seo/corpus"

export const prerender = false

export const GET: APIRoute = async ({ site, url }) => {
  const siteConfig = siteConfigMod.siteConfig || {}
  const siteUrl = site ? site.toString() : siteConfig.url || `${url.protocol}//${url.host}`
  const title = siteConfig.name
    ? `${siteConfig.name} Full Documentation Corpus`
    : "Full Documentation Corpus"
  const description = "Complete single-corpus documentation for AI agents and LLM ingest."

  // 1. Try corpusPages if available
  if (Array.isArray(corpusMod.corpusPages) && corpusMod.corpusPages.length > 0) {
    const sections = new Map<string, string[]>()
    for (const p of corpusMod.corpusPages) {
      const key = (p.section || "GENERAL").toUpperCase()
      if (!sections.has(key)) sections.set(key, [])
      const slug = p.slug === "index" ? "" : p.slug
      const pageUrl = `${siteUrl.replace(/\/$/, "")}/${slug}`.replace(/\/+$/, "")
      sections.get(key)!.push(`### ${p.title}\nURL: ${pageUrl}\n${p.description || ""}`)
    }

    const body = [
      `# ${title}`,
      "",
      description,
      "",
      ...Array.from(sections.entries()).flatMap(([section, pages]) => [
        `## ${section}`,
        "",
        ...pages,
        ""
      ])
    ].join("\n")

    return new Response(body, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400"
      }
    })
  }

  // 2. Try CMS renderCorpusMarkdown if db exists
  if (dbMod.db) {
    try {
      const { renderCorpusMarkdown } = await import("@rimelight/cms")
      const body = await renderCorpusMarkdown(dbMod.db, {
        type: "doc",
        locale: "en",
        siteUrl,
        title,
        description
      })

      return new Response(body, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=3600, s-maxage=86400"
        }
      })
    } catch {
      // Fallback
    }
  }

  return new Response(`# ${title}\n\n${description}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400"
    }
  })
}
