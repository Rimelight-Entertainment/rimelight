<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue"
import { t } from "@rimelight/i18n"
import { getLocalizedContent } from "@/utils/page"

export interface MentionSearchResult {
  slug: string
  title: Record<string, string>
  category?: string
  tags?: string[]
}

export interface MentionSearchProps {
  searchTerm: string
  onSelectPage: (slug: string, title: string) => void
  onClose: () => void
  position?: { top: number; left: number }
}

const { searchTerm, onSelectPage, onClose, position } = defineProps<MentionSearchProps>()

const locale = ref("en")
const results = ref<MentionSearchResult[]>([])
const loading = ref(false)
const focusedIndex = ref(0)

const categorizedResults = computed(() => {
  const q = searchTerm.toLowerCase()
  if (!q) return { matchingTitles: results.value, matchingCategories: [], matchingTags: [] }

  const matchingTitles: MentionSearchResult[] = []
  const matchingCategories: MentionSearchResult[] = []
  const matchingTags: MentionSearchResult[] = []

  results.value.forEach((r) => {
    const title = (getLocalizedContent(r.title, locale.value) || "").toLowerCase()
    const cat = (r.category || "").toLowerCase()
    const tags = (r.tags || []).map((tag) => tag.toLowerCase())

    if (title.includes(q)) matchingTitles.push(r)
    else if (cat.includes(q)) matchingCategories.push(r)
    else if (tags.some((tag) => tag.includes(q))) matchingTags.push(r)
  })

  return { matchingTitles, matchingCategories, matchingTags }
})

const flatItems = computed(() => {
  const { matchingTitles, matchingCategories, matchingTags } = categorizedResults.value
  return [
    ...(matchingTitles.length > 0
      ? [
          { type: "category" as const, label: t("mention.titles", "Titles") },
          ...matchingTitles.map((r) => ({ type: "result" as const, result: r }))
        ]
      : []),
    ...(matchingCategories.length > 0
      ? [
          { type: "category" as const, label: t("mention.categories", "Categories") },
          ...matchingCategories.map((r) => ({ type: "result" as const, result: r }))
        ]
      : []),
    ...(matchingTags.length > 0
      ? [
          { type: "category" as const, label: t("mention.tags", "Tags") },
          ...matchingTags.map((r) => ({ type: "result" as const, result: r }))
        ]
      : [])
  ]
})

const handleSelect = (result: MentionSearchResult) => {
  onSelectPage(result.slug, getLocalizedContent(result.title, locale.value) || result.slug)
}

const handleKeyDown = (e: KeyboardEvent) => {
  const resultItems = flatItems.value.filter((i) => i.type === "result")
  if (!resultItems.length) return
  if (e.key === "ArrowDown") {
    e.preventDefault()
    focusedIndex.value = (focusedIndex.value + 1) % resultItems.length
  } else if (e.key === "ArrowUp") {
    e.preventDefault()
    focusedIndex.value = (focusedIndex.value - 1 + resultItems.length) % resultItems.length
  } else if (e.key === "Enter") {
    e.preventDefault()
    const focused = resultItems[focusedIndex.value]
    if (focused && focused.type === "result") handleSelect(focused.result)
  } else if (e.key === "Escape") {
    e.preventDefault()
    onClose()
  }
}

watch(
  () => searchTerm,
  () => {
    focusedIndex.value = 0
  }
)

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest("[data-mention-search]")) onClose()
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside)
})
onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside)
})

defineOptions({ name: "MentionSearch" })
</script>

<template>
  <div
    data-mention-search
    :class="[
      'absolute z-50 mt-1 w-72 rounded-xl border border-default bg-white dark:bg-neutral-900 shadow-xl p-2 flex flex-col gap-0.5 max-h-64 overflow-y-auto'
    ]"
    :style="position ? { top: `${position.top}px`, left: `${position.left}px` } : undefined"
    @keydown="handleKeyDown"
  >
    <template v-if="flatItems.length > 0">
      <template v-for="(item, idx) in flatItems" :key="idx">
        <div
          v-if="item.type === 'category'"
          class="text-[10px] font-bold uppercase tracking-wider text-dimmed px-2 pt-2 pb-1"
        >
          {{ item.label }}
        </div>
        <button
          v-else
          :class="[
            'flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left w-full',
            idx === focusedIndex ? 'bg-neutral-100 dark:bg-neutral-800' : ''
          ]"
          @click="handleSelect(item.result)"
        >
          <span class="i-lucide-file-text size-4 shrink-0 text-dimmed" />
          <span class="truncate font-medium">{{
            getLocalizedContent(item.result.title, locale.value) || item.result.slug
          }}</span>
          <span class="text-xs text-dimmed truncate ml-auto">/{{ item.result.slug }}</span>
        </button>
      </template>
    </template>
    <div v-else class="text-xs text-dimmed text-center py-4">
      {{ t("mention.no_results", "No pages found") }}
    </div>
  </div>
</template>

<style scoped></style>
