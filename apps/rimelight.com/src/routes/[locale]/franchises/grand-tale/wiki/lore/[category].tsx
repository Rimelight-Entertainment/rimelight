import { type Component, For, Show } from "solid-js"
import { useParams } from "@solidjs/router"
import { createAsyncData } from "#utils/async"
import WikiLayout from "#layouts/WikiLayout"
import { getRelativeLocaleUrl, getLocale } from "@rimelight/i18n"

const categoryToType: Record<string, string> = {
  timeline: "Timeline",
  characters: "Character",
  locations: "Location",
  species: "Species",
  objects: "Object",
  groups: "Group"
}

export const LoreCategoryPage: Component = () => {
  const params = useParams<{ locale: string; category?: string }>()
  const activeLocale = () => getLocale()

  const category = () => params.category || "characters"
  const categoryLabel = () => category().charAt(0).toUpperCase() + category().slice(1)
  const pageType = () => categoryToType[category()] || "Character"

  const pagesData = createAsyncData(
    () => [category(), activeLocale()] as const,
    async ([cat]) => {
      const type = categoryToType[cat] || "Character"
      try {
        const res = await fetch(
          `/api/pages?type=${encodeURIComponent(type)}&limit=1000&orderBy=title&order=asc`
        )
        if (!res.ok) return []
        return (await res.json()) as any[]
      } catch {
        return []
      }
    },
    []
  )

  return (
    <WikiLayout title={`${categoryLabel()} | Grand Tale Wiki`}>
      <div class="space-y-6">
        <section class="space-y-4">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest rounded-full">
            {pageType()}
          </div>
          <h1 class="text-4xl font-extrabold uppercase tracking-tight text-white leading-none">
            {categoryLabel()}
          </h1>
          <p class="text-lg text-neutral-400 font-light max-w-2xl">
            Browse all {category().toLowerCase()} in the Grand Tale universe.
          </p>
        </section>

        <hr class="border-neutral-800/30" />

        <div class="bg-neutral-900/20 border border-neutral-800/50 rounded-2xl overflow-hidden">
          <table class="w-full border-collapse text-left text-sm">
            <thead>
              <tr class="border-b border-neutral-850 bg-neutral-900/50 text-xs font-bold uppercase text-indigo-400 tracking-wider">
                <th class="p-4">Title</th>
                <th class="p-4">Description</th>
                <th class="p-4 text-right"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-850">
              <For each={pagesData() || []}>
                {(page) => {
                  const titleStr =
                    typeof page.title === "string"
                      ? page.title
                      : page.title?.[activeLocale()] || page.title?.en || page.slug
                  const descStr =
                    typeof page.description === "string"
                      ? page.description
                      : page.description?.[activeLocale()] || page.description?.en || "---"
                  return (
                    <tr class="hover:bg-neutral-900/30 transition-colors">
                      <td class="p-4 flex items-center gap-3">
                        <span class="i-lucide-file-text size-5 text-indigo-500 shrink-0" />
                        <a
                          href={getRelativeLocaleUrl(`/${page.slug}`)}
                          class="font-bold text-white hover:text-indigo-400 uppercase transition-colors"
                        >
                          {titleStr}
                        </a>
                      </td>
                      <td class="p-4 text-neutral-400 truncate max-w-md">{descStr}</td>
                      <td class="p-4 text-right">
                        <a
                          href={getRelativeLocaleUrl(`/${page.slug}`)}
                          class="inline-flex items-center gap-2 text-xs text-indigo-500 font-bold uppercase hover:text-indigo-400 transition-colors"
                        >
                          Read More <span class="i-lucide-arrow-right size-3" />
                        </a>
                      </td>
                    </tr>
                  )
                }}
              </For>
              <Show when={!pagesData() || pagesData()!.length === 0}>
                <tr>
                  <td colspan={3} class="p-8 text-center text-neutral-500">
                    No {category().toLowerCase()} entries found.
                  </td>
                </tr>
              </Show>
            </tbody>
          </table>
        </div>
      </div>
    </WikiLayout>
  )
}

export default LoreCategoryPage
