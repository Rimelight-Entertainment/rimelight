<script setup lang="ts">
import { computed, ref, watch, nextTick } from "vue"
import type { Page, PageVersion, PageDefinition } from "~/types/pages"
import { getPageResolutionPath } from "~/utils/page"
import PageEditor from "../PageEditor.vue"

/* region Props */
export interface PageEditViewProps {
  lookupPath?: string
  fetchUrl?: string
  cacheKey: string
  pageDefinitions: Record<string, PageDefinition>
  baseUrl: string
  hierarchyPath?: string
  isAdmin?: boolean
  backUrl?: string
}

const {
  lookupPath,
  fetchUrl,
  cacheKey,
  pageDefinitions,
  baseUrl,
  hierarchyPath,
  isAdmin = false,
  backUrl
} = defineProps<PageEditViewProps>()
/* endregion */

/* region State */
const resolvedFetchUrl = computed(() => getPageResolutionPath(lookupPath || fetchUrl || ""))

const isSaving = ref(false)
const currentVersionId = ref<string | null>(null)
const editorRef = ref<{ resetHistory: () => void } | null>(null)

const localPage = ref<Page | null>(null)

// Custom manual fetch instead of useFetch (Astro compatibility/Vue SPA fallback)
const pageData = ref<Page | null>(null)
const pageStatus = ref<"idle" | "pending" | "success" | "error">("idle")

const fetchPageDetails = async () => {
  if (!resolvedFetchUrl.value) return
  pageStatus.value = "pending"
  try {
    const res = await fetch(resolvedFetchUrl.value)
    if (!res.ok) throw new Error("Failed to fetch")
    const data = await res.json()
    pageData.value = data
    localPage.value = JSON.parse(JSON.stringify(data))
    pageStatus.value = "success"
  } catch (err) {
    pageStatus.value = "error"
  }
}

watch(() => resolvedFetchUrl.value, fetchPageDetails, { immediate: true })
/* endregion */

/* region Logic */
const resolvePage = async (idOrSlug: string): Promise<Pick<Page, "title" | "icon" | "slug">> => {
  const url = getPageResolutionPath(idOrSlug)
  if (!url) throw new Error(`[Editor] Invalid page reference: ${idOrSlug}`)

  const res = await fetch(`${url}?select=title,icon,slug`)
  if (!res.ok) throw new Error(`[Editor] Page not found: ${idOrSlug}`)
  return await res.json()
}

const fetchPages = async () => {
  const types = Object.keys(pageDefinitions).join(",")
  const prefix = (hierarchyPath ?? baseUrl).replace(/^\/|\/$/g, "")

  const res = await fetch(`/api/pages/list?select=title,slug,type,id&types=${types}&prefix=${prefix}`)
  if (!res.ok) throw new Error("Failed to fetch page list")
  return await res.json()
}

const handleSave = async (updatedPage: Page): Promise<void> => {
  if (!updatedPage.id) return
  isSaving.value = true

  try {
    await fetch(`/api/pages/id/${updatedPage.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedPage)
    })

    await fetchPageDetails()

    await nextTick()
    editorRef.value?.resetHistory()
  } catch (e) {
    console.error(e)
  } finally {
    isSaving.value = false
  }
}

const handlePublish = async (updatedPage: Page): Promise<void> => {
  if (!updatedPage.id) return
  isSaving.value = true

  try {
    await fetch(`/api/pages/id/${updatedPage.id}/publish`, {
      method: "POST"
    })

    const base = baseUrl.replace(/\/$/, "")
    const cleanBase = base.replace(/^\//, "")
    const slugToUse = updatedPage.slug.startsWith(cleanBase)
      ? updatedPage.slug
      : `${cleanBase}/${updatedPage.slug}`
    
    if (typeof window !== "undefined") {
      window.location.href = `/${slugToUse}`
    }
  } catch (e) {
    console.error(e)
  } finally {
    isSaving.value = false
  }
}

const handleUnpublish = async (updatedPage: Page): Promise<void> => {
  if (!updatedPage.id) return
  isSaving.value = true

  try {
    await fetch(`/api/pages/id/${updatedPage.id}/unpublish`, {
      method: "POST"
    })
    await fetchPageDetails()
  } catch (e) {
    console.error(e)
  } finally {
    isSaving.value = false
  }
}

const handleDelete = async (id: string) => {
  try {
    await fetch(`/api/pages/id/${id}`, {
      method: "DELETE"
    })

    const dest = backUrl || baseUrl
    if (typeof window !== "undefined") {
      window.location.href = dest
    }
  } catch (e) {
    console.error(e)
  }
}

const handleVersionNavigate = (version: PageVersion) => {
  if (!version?.id || !localPage.value?.slug) return

  const base = baseUrl.replace(/\/$/, "")
  const cleanBase = base.replace(/^\//, "")
  const slugToUse = localPage.value.slug.startsWith(cleanBase)
    ? localPage.value.slug
    : `${cleanBase}/${localPage.value.slug}`

  if (typeof window !== "undefined") {
    window.location.href = `/${slugToUse}/review?version=${version.id}`
  }
}

const handleNavigateToPage = (slug: string) => {
  const base = baseUrl.replace(/\/$/, "")
  const cleanBase = base.replace(/^\//, "")
  const slugToUse = slug.startsWith(cleanBase) ? slug : `${cleanBase}/${slug}`

  if (typeof window !== "undefined") {
    window.location.href = `/${slugToUse}/edit`
  }
}
/* endregion */

defineOptions({
  name: "PageEditView"
})
</script>

<template>
  <div v-if="pageStatus === 'pending'" class="h-full w-full flex items-center justify-center p-12">
    <span class="i-lucide-loader-2 size-12 animate-spin text-neutral-400" />
  </div>

  <div v-else-if="pageStatus === 'error' || !localPage" class="p-8 text-center">
    <h3 class="text-lg font-bold text-red-600">Page Not Found</h3>
    <p class="text-neutral-500 mt-2">The requested page could not be loaded.</p>
  </div>

  <template v-else-if="localPage && localPage.id">
    <PageEditor
      ref="editorRef"
      v-model="localPage"
      v-model:current-version-id="currentVersionId"
      :is-saving="isSaving"
      :is-admin="isAdmin"
      :base-path="(hierarchyPath ?? baseUrl).replace(/^\/|\/$/g, '')"
      :page-definitions="pageDefinitions"
      :resolve-page="resolvePage"
      :on-fetch-pages="fetchPages"
      :on-delete-page="handleDelete"
      :on-navigate-to-page="handleNavigateToPage"
      @save="handleSave"
      @publish="handlePublish"
      @unpublish="handleUnpublish"
      @version-navigate="handleVersionNavigate"
    />
  </template>
</template>
