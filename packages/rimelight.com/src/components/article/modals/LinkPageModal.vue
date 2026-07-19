<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { useI18n } from "@/composables/app/useI18n"
import { getLocalizedContent } from "@/utils/page"
import RLVButton from "@rimelight/ui/components/button/RLVButton.vue"
import RLVInput from "@rimelight/ui/components/input/RLVInput.vue"

export interface PageResult {
  slug: string
  title: Record<string, string>
  icon?: { src?: string; alt?: string }
}

export interface LinkPageModalProps {
  searchResults?: PageResult[]
  loading?: boolean
}

const { searchResults = [], loading } = defineProps<LinkPageModalProps>()

export interface LinkPageModalEmits {
  close: []
  select: [slug: string]
}
const emit = defineEmits<LinkPageModalEmits>()

const open = defineModel<boolean>("open", { default: false })
const { t, locale } = useI18n()
const localSearch = ref("")
const debouncedSearch = ref("")
let debounceTimer: ReturnType<typeof setTimeout>

watch(localSearch, (val) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debouncedSearch.value = val
  }, 300)
})

watch(open, (isOpen) => {
  if (!isOpen) emit("close")
})

const filteredResults = computed(() => {
  if (!debouncedSearch.value) return searchResults
  const q = debouncedSearch.value.toLowerCase()
  return searchResults.filter((r) => {
    const title = getLocalizedContent(r.title, locale.value) || ""
    return title.toLowerCase().includes(q) || r.slug.toLowerCase().includes(q)
  })
})

const handleSelect = (slug: string) => {
  emit("select", slug)
  open.value = false
}

defineOptions({ name: "LinkPageModal" })
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    @click.self="open = false"
  >
    <div
      class="bg-white dark:bg-neutral-900 border border-default rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col"
    >
      <div class="flex items-center justify-between px-4 py-3 border-b border-default">
        <h3 class="text-base font-semibold leading-6">
          {{ t("page_editor.link_page", "Link Page") }}
        </h3>
        <RLVButton
          color="neutral"
          variant="ghost"
          leading-icon="i-lucide-x"
          class="!p-1.5"
          @click="open = false"
        />
      </div>
      <div class="p-4 min-h-[200px] max-h-[60vh] overflow-y-auto">
        <div class="mb-4">
          <RLVInput
            v-model="localSearch"
            leading-icon="i-lucide-search"
            :placeholder="t('page_editor.search_pages', 'Search pages...')"
            autofocus
            color="neutral"
            class="w-full"
          />
        </div>
        <div v-if="loading" class="flex justify-center py-8">
          <span class="i-lucide-loader-2 size-6 animate-spin text-neutral-400" />
        </div>
        <div
          v-else-if="filteredResults.length === 0"
          class="flex flex-col items-center justify-center py-12 text-center text-dimmed"
        >
          <span class="i-lucide-search-slash size-10 mb-3" />
          <p>{{ t("page_editor.no_results", "No pages found") }}</p>
        </div>
        <div v-else class="space-y-1">
          <button
            v-for="result in filteredResults"
            :key="result.slug"
            class="flex items-center gap-3 p-2.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition text-left w-full border border-transparent hover:border-default"
            @click="handleSelect(result.slug)"
          >
            <div
              class="size-8 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0"
            >
              <span class="i-lucide-file-text size-4 text-dimmed" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium truncate">
                {{ getLocalizedContent(result.title, locale.value) || result.slug }}
              </div>
              <div class="text-xs text-dimmed truncate">/{{ result.slug }}</div>
            </div>
          </button>
        </div>
      </div>
      <div class="flex justify-end gap-2 p-4 border-t border-default">
        <RLVButton
          color="neutral"
          variant="ghost"
          :label="t('common.cancel', 'Cancel')"
          @click="open = false"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
