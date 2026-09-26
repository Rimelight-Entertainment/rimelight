import { type Component, Show } from "solid-js"
import { useParams } from "@solidjs/router"
import AppLayout from "#layouts/AppLayout"
import PageRenderer from "#components/cms/PageRenderer"
import { createAsyncData } from "#utils/async"
import { t, getLocale } from "@rimelight/i18n"
import { db } from "#db"
import { pages } from "#db/schema"
import { eq, and, isNull } from "drizzle-orm"

function getLocalizedText(val: unknown, locale: string): string {
  if (typeof val === "object" && val !== null) {
    const record = val as Record<string, string>
    return record[locale] || record["en"] || ""
  }
  return typeof val === "string" ? val : ""
}

export const LegalSlugPage: Component = () => {
  const params = useParams<{ locale: string; slug: string }>()
  const activeLocale = () => getLocale()

  const pageData = createAsyncData(
    () => params["slug"],
    async (slug) => {
      if (!slug) return null
      try {
        const results = await db
          .select()
          .from(pages)
          .where(and(eq(pages.type, "legal"), eq(pages.slug, slug), isNull(pages.deletedAt)))
          .limit(1)
        return results[0] || null
      } catch {
        return null
      }
    }
  )

  const title = () => (pageData() ? getLocalizedText(pageData()!.title, activeLocale()) : "Legal")
  const description = () =>
    pageData() ? getLocalizedText(pageData()!.description, activeLocale()) : ""
  const content = () => {
    const p = pageData()
    if (!p) return {}
    return typeof p.content === "string" ? JSON.parse(p.content) : p.content || {}
  }

  return (
    <AppLayout title={title()} description={description()}>
      <div class="container mx-auto px-4 py-16 max-w-3xl">
        <Show when={pageData()} fallback={<div class="p-8 text-center text-muted">Loading...</div>}>
          <article>
            <div class="prose max-w-none">
              <div class="title mb-8">
                <div class="date text-neutral-400 mb-2 text-sm">
                  <time>
                    {new Date(pageData()!.postedAt || pageData()!.createdAt).toLocaleDateString(
                      activeLocale()
                    )}
                  </time>
                  <Show when={pageData()!.updatedAt}>
                    <div class="last-updated-on text-xs text-neutral-500 mt-1">
                      {t("legal.lastUpdatedOn")}{" "}
                      <time>
                        {new Date(pageData()!.updatedAt!).toLocaleDateString(activeLocale())}
                      </time>
                    </div>
                  </Show>
                </div>
                <h1 class="text-4xl font-extrabold text-highlighted mb-4">{title()}</h1>
                <hr class="border-default" />
              </div>
              <PageRenderer blocks={content().blocks || []} locale={activeLocale()} />
            </div>
          </article>
        </Show>
      </div>
    </AppLayout>
  )
}

export default LegalSlugPage
