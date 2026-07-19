<script setup lang="ts">
import { inject, ref, watch, computed } from "vue"
import { getLocalizedContent } from "./utils/page"
import { useI18n } from "./utils/editorHelpers"
import type { Page } from "./types/pages"
import { scv, cx } from "css-variants"

export interface PageMentionProps {
  pageId: string
  fallbackLabel?: string
}

const { pageId, fallbackLabel } = defineProps<PageMentionProps>()

const pageMentionStyles = scv({
  slots: ["linkClass", "iconClass", "textClass", "skeletonClass", "unresolvedText"],
  base: {
    linkClass:
      "inline-flex items-baseline gap-1 align-middle text-primary hover:underline transition-colors font-medium text-inherit",
    iconClass: "w-4 h-4 rounded-full object-cover shrink-0",
    textClass: "truncate font-medium capitalize",
    skeletonClass:
      "h-3 w-24 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse inline-block align-middle",
    unresolvedText: "text-xs text-dimmed italic"
  }
})

const styles = computed(() => pageMentionStyles())

const { locale } = useI18n()
const resolver =
  inject<(id: string) => Promise<Pick<Page, "title" | "icon" | "slug">>>("page-resolver")
const linkedPage = ref<Pick<Page, "title" | "icon" | "slug"> | null>(null)
const status = ref<"idle" | "pending" | "success" | "error">("idle")

const cleanPath = computed(() => (pageId || "").replace(/^\//, ""))

const loadPage = async () => {
  if (!pageId) return
  status.value = "pending"
  if (!resolver) {
    status.value = "error"
    return
  }
  try {
    const res = await resolver(pageId)
    if (res && res.slug) {
      linkedPage.value = res
      status.value = "success"
    } else {
      status.value = "error"
    }
  } catch (e) {
    status.value = "error"
  }
}

watch(() => pageId, loadPage, { immediate: true })

defineOptions({ name: "PageMention" })
</script>

<template>
  <a
    v-if="linkedPage && linkedPage.slug"
    :href="`/${linkedPage.slug.replace(/^\//, '')}`"
    :class="styles.linkClass"
  >
    <img
      v-if="linkedPage.icon?.src"
      :src="linkedPage.icon.src"
      :alt="linkedPage.icon.alt || 'Icon'"
      :class="styles.iconClass"
    />
    <span :class="styles.textClass">
      {{ getLocalizedContent(linkedPage.title, locale) }}
    </span>
  </a>

  <div v-else-if="status === 'pending'" :class="styles.skeletonClass" />

  <a v-else-if="cleanPath" :href="`/${cleanPath}`" :class="styles.linkClass">
    <span :class="styles.textClass">
      {{ fallbackLabel || cleanPath.split("/").pop()?.replace(/-/g, " ") }}
    </span>
  </a>
</template>
