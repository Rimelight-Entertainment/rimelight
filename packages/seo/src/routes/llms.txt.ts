import type { APIRoute } from "astro"
import { buildLlmsTxt, type LlmsPage } from "../llms.js"
import * as siteConfigMod from "virtual:rimelight-seo/site-config"
import * as dbMod from "virtual:rimelight-seo/db"
import * as corpusMod from "virtual:rimelight-seo/corpus"
import seoOptions from "virtual:rimelight-seo/options"

export const prerender = false

export const GET: APIRoute = async ({ site, url }) => {
  const siteConfig = siteConfigMod.siteConfig || {}
  const siteUrl = site ? site.toString() : (siteConfig.url || `${url.protocol}//${url.host}`)
  const llmsOpts = typeof seoOptions?.llms === "object" ? seoOptions.llms : {}

  let pages: LlmsPage[] = []

  if (Array.isArray(llmsOpts.pages) && llmsOpts.pages.length > 0) {
    pages = llmsOpts.pages
  } else if (Array.isArray(corpusMod.corpusPages) && corpusMod.corpusPages.length > 0) {
    pages = corpusMod.corpusPages.map((p: any) => {
      const slug = p.slug === "index" ? "" : p.slug
      const pageUrl = `${siteUrl.replace(/\/$/, "")}/${slug}`.replace(/\/+$/, "")
      return {
        title: p.title,
        description: p.description,
        url: pageUrl,
        section: p.section ? p.section.toUpperCase() : "GENERAL"
      }
    })
  } else if (dbMod.db) {
    try {
      const { pages: pagesTable } = await import("#db/schema").catch(() => ({ pages: null }))
      const { and, isNotNull, isNull } = await import("drizzle-orm")
      if (pagesTable) {
        const docRows = await dbMod.db
          .select()
          .from(pagesTable)
          .where(and(isNull(pagesTable.deletedAt), isNotNull(pagesTable.publishedVersionId)))
          .catch(() => [])

        const resolveLocalized = (val: unknown): string => {
          if (typeof val === "string") return val
          if (typeof val === "object" && val !== null) {
            const rec = val as Record<string, string>
            return rec["en"] || Object.values(rec)[0] || ""
          }
          return typeof val === "number" ? String(val) : ""
        }

        pages = docRows.map((p: any) => {
          const title = resolveLocalized(p.title) || p.slug
          const description = resolveLocalized(p.description)
          const slug = p.slug === "index" ? "" : p.slug
          const pathPrefix = p.type === "doc" ? "docs" : p.type || "docs"
          const pageUrl = `${siteUrl.replace(/\/$/, "")}/en/${pathPrefix}/${slug}`.replace(/\/+$/, "")
          const markdownUrl = `${pageUrl}.md`

          return {
            title,
            description,
            url: pageUrl,
            markdownUrl,
            section: p.type ? p.type.toUpperCase() : "GENERAL"
          }
        })
      }
    } catch {
      // Fallback
    }
  }

  const title = llmsOpts.title || siteConfig.name || "Documentation"
  const description =
    llmsOpts.description || siteConfig.description || "Documentation index for AI agents."

  const body = buildLlmsTxt({
    site: siteUrl,
    title,
    description,
    pages,
    ...llmsOpts
  })

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400"
    }
  })
}
