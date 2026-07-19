<script setup lang="ts">
import { computed, ref, watch } from "vue"
import type { Page } from "../types/pages"
import { getPageResolutionPath } from "../utils/page"
import PageRenderer from "../PageRenderer.vue"

export interface PageLiveViewProps {
  lookupPath?: string
  fetchUrl?: string
  cacheKey?: string
  baseUrl: string
  canEdit?: boolean
}
const {
  lookupPath,
  fetchUrl,
  cacheKey,
  baseUrl,
  canEdit = false
} = defineProps<PageLiveViewProps>()

const resolvedFetchUrl = computed(() => getPageResolutionPath(lookupPath || fetchUrl || ""))
const page = ref<Page | null>(null)
const pageStatus = ref<"idle" | "pending" | "success" | "error">("idle")

const fetchPage = async () => {
  if (!resolvedFetchUrl.value) return
  pageStatus.value = "pending"
  try {
    const res = await fetch(resolvedFetchUrl.value)
    if (!res.ok) throw new Error("Failed to fetch page")
    const data = await res.json()
    page.value = data
    pageStatus.value = "success"
  } catch (err) {
    pageStatus.value = "error"
  }
}

watch(() => resolvedFetchUrl.value, fetchPage, { immediate: true })

const resolvePage = async (idOrSlug: string) => {
  if (!idOrSlug) return null
  const clean = idOrSlug.replace(/^\//, "")
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean)
    const url = isUuid ? `/api/pages/id/${clean}` : `/api/pages/find/${clean}`
    const res = await fetch(url)
    if (res.ok) return await res.json()
    const res2 = await fetch(`/api/pages/find/${clean}`)
    if (res2.ok) return await res2.json()
    return null
  } catch (err) {
    console.warn("[PageLiveView resolvePage Error]:", err)
    return null
  }
}

const editUrl = computed(() => {
  const base = baseUrl.replace(/\/$/, "")
  if (page.value?.slug) {
    const slug = page.value.slug
    const cleanBase = base.replace(/^\//, "")
    if (slug.startsWith(cleanBase)) {
      return `/${slug}/edit`
    }
    return `${base}/${slug}/edit`
  }
  return `${base}/edit`
})

defineOptions({ name: "PageLiveView" })
</script>

<template>
  <div v-if="pageStatus === 'pending'" class="h-full w-full flex items-center justify-center p-12">
    <span class="i-lucide-loader-2 size-12 animate-spin text-neutral-400" />
  </div>
  <div v-else-if="pageStatus === 'error' || !page" class="p-8 text-center">
    <h3 class="text-lg font-bold text-red-600">Page Not Found</h3>
    <p class="text-neutral-500 mt-2">The requested page could not be located.</p>
  </div>
  <PageRenderer
    v-else
    v-model="page"
    :resolve-page="resolvePage"
    :can-edit="canEdit"
    :edit-url="editUrl"
  />
</template>
