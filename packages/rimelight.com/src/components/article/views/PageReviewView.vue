<script setup lang="ts">
import { ref, computed, watch } from "vue"
import type { Page, PageVersion, PageDefinition } from "@/types/pages"
import {
  convertVersionToPage,
  syncPageWithDefinition,
  getPageResolutionPath,
  getLocalizedContent
} from "@/utils/page"
import { usePageRegistry, useRC } from "@/composables"
import { useI18n } from "@/composables/app/useI18n"
import PageRenderer from "../PageRenderer.vue"
import RLVButton from "@rimelight/ui/components/button/RLVButton.vue"
import PageVersionSelector from "../PageVersionSelector.vue"
/* region Props */
export interface PageReviewViewProps {
  lookupPath: string
  versionId?: string | null
  pageDefinitions: Record<string, PageDefinition>
  baseUrl: string
  isAdmin?: boolean
  rc?: {
    header?: string
    headerGroup?: string
    splitContainer?: string
    editorColumn?: string
    resizer?: string
    previewColumn?: string
    headerText?: string
    headerHighLight?: string
    headerSeparator?: string
  }
}
const {
  lookupPath,
  versionId,
  pageDefinitions,
  baseUrl,
  isAdmin = false,
  rc: rcProp
} = defineProps<PageReviewViewProps>()
const { rc } = useRC("PageReviewView", rcProp)
/* endregion */
/* region Emits */
export interface PageReviewViewEmits {
  approved: [version: PageVersion]
  rejected: [version: PageVersion]
}
const emit = defineEmits<PageReviewViewEmits>()
/* endregion */
/* region State */
const { t, locale } = useI18n()
const { registerDefinitions } = usePageRegistry()
registerDefinitions(pageDefinitions)
const page = ref<Page | null>(null)
const pageStatus = ref<"idle" | "pending" | "success" | "error">("idle")
const fetchBasePage = async () => {
  const url = getPageResolutionPath(lookupPath)
  if (!url) return
  pageStatus.value = "pending"
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error("Failed to fetch page")
    page.value = await res.json()
    pageStatus.value = "success"
  } catch (err) {
    pageStatus.value = "error"
  }
}
const versionData = ref<PageVersion | null>(null)
const versionStatus = ref<"idle" | "pending" | "success" | "error">("idle")
const fetchVersionData = async () => {
  if (!versionId) {
    versionData.value = null
    return
  }
  versionStatus.value = "pending"
  try {
    const res = await fetch(`/api/pages/versions/${versionId}`)
    if (!res.ok) throw new Error("Failed to fetch version")
    versionData.value = await res.json()
    versionStatus.value = "success"
  } catch (err) {
    versionStatus.value = "error"
  }
}
watch(() => lookupPath, fetchBasePage, { immediate: true })
watch(() => versionId, fetchVersionData, { immediate: true })
const localPage = ref<Page | null>(null)
watch(
  [page, versionData],
  () => {
    if (versionId && versionData.value) {
      const converted = convertVersionToPage(versionData.value)
      const typeKey = Object.keys(pageDefinitions).find(
        (k) => k.toLowerCase() === converted.type?.toLowerCase()
      )
      const definition = typeKey ? pageDefinitions[typeKey] : null
      if (definition) {
        syncPageWithDefinition(converted, definition)
      }
      localPage.value = converted
    } else if (page.value) {
      const cloned = JSON.parse(JSON.stringify(page.value))
      const typeKey = Object.keys(pageDefinitions).find(
        (k) => k.toLowerCase() === cloned.type?.toLowerCase()
      )
      const definition = typeKey ? pageDefinitions[typeKey] : null
      if (definition) {
        syncPageWithDefinition(cloned, definition)
      }
      localPage.value = cloned
    }
  },
  { immediate: true }
)
const showCompare = ref(false)
const leftWidth = ref(50)
const isActioning = ref<string | null>(null)
/* endregion */
/* region Logic */
const resolvePage = async (idOrSlug: string): Promise<Pick<Page, "title" | "icon" | "slug">> => {
  const url = getPageResolutionPath(idOrSlug)
  if (!url) throw new Error(`[Review] Invalid page reference: ${idOrSlug}`)
  const res = await fetch(`${url}?select=title,icon,slug`)
  if (!res.ok) throw new Error(`[Review] Page not found: ${idOrSlug}`)
  return await res.json()
}
const navigateToView = () => {
  if (typeof window !== "undefined") {
    window.location.href = `/${relativeSlug.value}`
  }
}
const navigateToVersion = (v: PageVersion) => {
  if (typeof window !== "undefined") {
    window.location.search = `?version=${v.id}`
  }
}
const handleApprove = async () => {
  if (!versionId || !isAdmin) return
  isActioning.value = "approving"
  try {
    await fetch(`/api/pages/versions/${versionId}/approve`, { method: "POST" })
    await fetchBasePage()
    if (versionData.value) {
      emit("approved", versionData.value)
    }
    if (page.value?.slug) {
      const base = baseUrl.replace(/\/$/, "")
      const cleanBase = base.replace(/^\//, "")
      const slugToUse = page.value.slug.startsWith(cleanBase)
        ? page.value.slug
        : `${cleanBase}/${page.value.slug}`
      if (typeof window !== "undefined") {
        window.location.href = `/${slugToUse}`
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    isActioning.value = null
  }
}
const handleReject = async () => {
  if (!versionId || !isAdmin) return
  isActioning.value = "rejecting"
  try {
    await fetch(`/api/pages/versions/${versionId}/reject`, { method: "POST" })
    await fetchBasePage()
    if (versionData.value) {
      emit("rejected", versionData.value)
    }
    if (page.value?.slug) {
      const base = baseUrl.replace(/\/$/, "")
      const cleanBase = base.replace(/^\//, "")
      const slugToUse = page.value.slug.startsWith(cleanBase)
        ? page.value.slug
        : `${cleanBase}/${page.value.slug}`
      if (typeof window !== "undefined") {
        window.location.href = `/${slugToUse}/edit`
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    isActioning.value = null
  }
}
const relativeSlug = computed(() => {
  if (page.value?.slug) return page.value.slug
  const base = baseUrl.replace(/^\/|\/$/g, "")
  return lookupPath.replace(base, "").replace(/^\/|\/$/g, "")
})
/* endregion */
defineOptions({
  name: "PageReviewView"
})
</script>

<template>
  <div
    v-if="pageStatus === 'pending' || (versionId && versionStatus === 'pending')"
    class="h-full w-full flex items-center justify-center p-12"
  >
    <span class="i-lucide-loader-2 size-12 animate-spin text-neutral-400" />
  </div>

  <div
    v-else-if="pageStatus === 'error' || versionStatus === 'error' || !localPage"
    class="p-8 text-center"
  >
    <h3 class="text-lg font-bold text-red-600">Version Not Found</h3>
    <p class="text-neutral-500 mt-2">The requested page version could not be located.</p>
  </div>

  <template v-else>
    <div
      class="h-12 w-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-between px-4 border-b border-default"
    >
      <div class="flex items-center gap-2">
        <span class="text-xs text-neutral-500 font-medium">
          Reviewing:
          <span class="text-neutral-900 dark:text-white font-semibold">
            {{ getLocalizedContent(localPage?.title, locale) }}
          </span>
        </span>
        <span class="w-px h-4 bg-neutral-200 dark:bg-neutral-700 mx-2" />
        <PageVersionSelector
          v-if="page?.id"
          :page-id="page.id"
          :current-version-id="versionId || undefined"
          :is-admin="isAdmin"
          @version-selected="navigateToVersion"
        />
      </div>

      <div class="flex items-center gap-2">
        <RLVButton
          color="neutral"
          variant="ghost"
          leading-icon="i-lucide-external-link"
          :label="t('page_editor.view_page', 'View Page')"
          @click="navigateToView"
        />
        <RLVButton
          color="neutral"
          variant="ghost"
          :leading-icon="showCompare ? 'i-lucide-eye-off' : 'i-lucide-eye'"
          :label="showCompare ? 'Hide' : 'Compare'"
          @click="showCompare = !showCompare"
        />
        <span class="w-px h-4 bg-neutral-200 dark:bg-neutral-700 mx-2" />

        <template v-if="isAdmin && versionId && versionData?.status === 'pending'">
          <RLVButton
            leading-icon="i-lucide-x"
            :label="t('common.reject', 'Reject')"
            color="danger"
            variant="outline"
            :loading="isActioning === 'rejecting'"
            @click="handleReject"
          />
          <RLVButton
            leading-icon="i-lucide-check"
            :label="t('common.approve', 'Approve Version')"
            color="primary"
            :loading="isActioning === 'approving'"
            @click="handleApprove"
          />
        </template>

        <template v-else-if="versionId && versionData?.status === 'approved'">
          <span
            class="text-xs bg-green-500/10 text-green-600 px-2.5 py-1 rounded-md font-medium border border-green-500/20"
          >
            Version Already Approved
          </span>
        </template>

        <template v-else-if="versionId && versionData?.status === 'rejected'">
          <span
            class="text-xs bg-red-500/10 text-red-600 px-2.5 py-1 rounded-md font-medium border border-green-500/20"
          >
            Version Rejected
          </span>
        </template>
      </div>
    </div>

    <div class="flex w-full min-h-0">
      <div :style="{ width: showCompare ? `${leftWidth}%` : '100%' }" class="overflow-y-auto">
        <PageRenderer
          v-if="localPage"
          :key="versionId || 'live'"
          v-model="localPage"
          :resolve-page="resolvePage"
          class="h-full"
        />
      </div>

      <div
        v-if="showCompare"
        :style="{ width: `${100 - leftWidth}%` }"
        class="overflow-y-auto border-l border-default bg-neutral-50/50 dark:bg-neutral-900/10"
      >
        <PageRenderer
          v-if="page"
          :key="'live-base-' + page.id"
          :model-value="page"
          :resolve-page="resolvePage"
          class="opacity-70 pointer-events-none select-none h-full"
        />
      </div>
    </div>
  </template>
</template>
