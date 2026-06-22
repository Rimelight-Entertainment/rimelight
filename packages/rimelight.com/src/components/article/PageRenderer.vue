<script setup lang="ts">
import { computed, provide, watch } from "vue"
import type { Page, PageSurround } from "@/types/pages"
import { getLocalizedContent, syncPageWithDefinition } from "@/utils/page"
import { useI18n } from "@/composables/app/useI18n"
import { usePageRegistry, useRC } from "@/composables"
import { scv, cx } from "css-variants"
import PagePropertiesRenderer from "./PagePropertiesRenderer.vue"
import BlockViewRenderer from "./blocks/BlockViewRenderer.vue"
import PageSurroundComponent from "./PageSurround.vue"

/* region Props */
export interface PageRendererProps {
  useSurround?: boolean
  surround?: PageSurround | null
  surroundStatus?: "idle" | "pending" | "success" | "error"
  resolvePage: (id: string) => Promise<Pick<Page, "title" | "icon" | "slug">>
  canEdit?: boolean
  editUrl?: string
  rc?: {
    container?: string
    grid?: string
    toc?: string
    properties?: string
    contentWrapper?: string
    banner?: string
    icon?: string
    title?: string
    surroundSkeleton?: string
    skeleton?: string
    metadata?: string
  }
}

const {
  useSurround = false,
  surroundStatus = "idle",
  surround = null,
  resolvePage,
  canEdit = false,
  editUrl,
  rc: rcProp
} = defineProps<PageRendererProps>()
const { rc } = useRC("PageRenderer", rcProp)
provide("page-resolver", resolvePage)
/* endregion */

/* region Styles */
const pageRendererStyles = scv({
  slots: {
    container: "flex flex-col py-16 w-full max-w-7xl mx-auto px-4",
    grid: "grid grid-cols-1 lg:grid-cols-24 gap-8 items-start",
    toc: "hidden lg:flex lg:col-span-4 sticky top-16",
    properties: "order-1 lg:order-2 lg:col-span-6",
    contentWrapper: "order-2 lg:order-1 lg:col-span-14 flex flex-col gap-8 w-full min-w-0",
    banner: "rounded-xl w-full object-cover max-h-[300px]",
    icon: "rounded-full w-12 h-12 object-cover border border-default shadow-sm",
    title: "text-4xl font-bold text-neutral-900 dark:text-neutral-100 mt-2",
    surroundSkeleton: "grid grid-cols-1 gap-4 sm:grid-cols-2 mt-8",
    skeleton: "h-48 w-full rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse",
    metadata:
      "flex flex-col gap-1 text-xs text-dimmed p-4 bg-neutral-50 dark:bg-neutral-900/40 rounded-xl border border-default mt-8"
  }
})

const styles = computed(() => {
  const resolved = pageRendererStyles()
  const result: Record<string, string> = {}
  for (const [slot, value] of Object.entries(resolved)) {
    result[slot] = cx(value, (rc.value as Record<string, string>)[slot])
  }
  return result as Record<string, string>
})
/* endregion */

/* region State */
const page = defineModel<Page>({ required: true })
const { getTypeLabelKey, definitions } = usePageRegistry()
const { t, locale } = useI18n()

const currentDefinition = computed(() => {
  if (!page.value?.type || !definitions) return null
  const typeKey = Object.keys(definitions).find(
    (k) => k.toLowerCase() === page.value.type.toLowerCase()
  )
  return typeKey ? (definitions as any)[typeKey] : null
})

const previousPage = computed(() => surround?.previous)
const nextPage = computed(() => surround?.next)
const hasSurround = computed(() => !!(surround?.previous || surround?.next))
/* endregion */

/* region Meta */
defineOptions({ name: "PageRenderer" })
/* endregion */

/* region Lifecycle */
watch(
  [() => page.value?.id, () => page.value?.type, currentDefinition],
  () => {
    if (page.value && currentDefinition.value) {
      console.log("[PageRenderer] Syncing page with definition", page.value.id)
      syncPageWithDefinition(page.value, currentDefinition.value)
    }
  },
  { immediate: true }
)
/* endregion */
</script>

<template>
  <div :class="styles.container">
    <div :class="styles.grid">
      <PagePropertiesRenderer
        v-model="page"
        :can-edit="canEdit"
        :edit-url="editUrl"
        :class="styles.properties"
      />

      <div :class="styles.contentWrapper">
        <img
          v-if="page.banner?.src"
          :src="page.banner?.src"
          :alt="page.banner?.alt || 'Banner'"
          :class="styles.banner"
        />

        <div class="border-b border-default pb-4">
          <span class="text-xs uppercase tracking-wider text-primary font-bold">
            {{ page.type }}
          </span>
          <h1 :class="styles.title">
            {{ getLocalizedContent(page.title, locale) }}
          </h1>
          <p v-if="page.description" class="text-neutral-500 dark:text-neutral-400 mt-2 text-lg">
            {{ getLocalizedContent(page.description, locale) }}
          </p>
        </div>

        <BlockViewRenderer :blocks="page.blocks || []" />

        <template v-if="useSurround">
          <div v-if="surroundStatus === 'pending'" :class="styles.surroundSkeleton">
            <div :class="styles.skeleton" />
            <div :class="styles.skeleton" />
          </div>

          <PageSurroundComponent
            v-else-if="surroundStatus === 'success' && hasSurround"
            :pageType="page.type"
            :previousTitle="getLocalizedContent(previousPage?.title, locale)"
            :previousDescription="getLocalizedContent(previousPage?.description, locale)"
            :previousTo="previousPage?.slug ? `/${previousPage.slug}` : undefined"
            :nextTitle="getLocalizedContent(nextPage?.title, locale)"
            :nextDescription="getLocalizedContent(nextPage?.description, locale)"
            :nextTo="nextPage?.slug ? `/${nextPage.slug}` : undefined"
          />

          <div :class="styles.metadata">
            <h6 class="font-bold text-neutral-800 dark:text-neutral-200">Metadata</h6>
            <span>ID: {{ page.id }}</span>
            <span v-if="page.createdAt">
              Created: {{ new Date(page.createdAt).toLocaleString() }}
            </span>
            <span v-if="page.updatedAt">
              Updated: {{ new Date(page.updatedAt).toLocaleString() }}
            </span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
