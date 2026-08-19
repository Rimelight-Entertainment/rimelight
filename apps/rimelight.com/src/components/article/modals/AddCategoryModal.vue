<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { t } from "@rimelight/i18n"
import RLVInput from "@rimelight/ui/components/input/RLVInput.vue"

export interface CategoryInfo {
  id: string
  label: string
  description?: string
}

export interface AddCategoryModalProps {
  availableCategories: CategoryInfo[]
  existingCategories: string[]
}

const { availableCategories, existingCategories } = defineProps<AddCategoryModalProps>()

export interface AddCategoryModalEmits {
  close: []
  select: [categoryId: string]
}
const emit = defineEmits<AddCategoryModalEmits>()

const open = defineModel<boolean>("open", { default: false })
const searchTerm = ref("")
const focusedIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)

const filteredCategories = computed(() => {
  const q = searchTerm.value.toLowerCase()
  return availableCategories.filter(
    (c) => c.label.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
  )
})

const handleSelect = (categoryId: string) => {
  if (existingCategories.includes(categoryId)) return
  emit("select", categoryId)
  open.value = false
}

const handleKeyDown = (e: KeyboardEvent) => {
  const list = filteredCategories.value
  if (!list.length) return
  if (e.key === "ArrowDown") {
    e.preventDefault()
    focusedIndex.value = (focusedIndex.value + 1) % list.length
  } else if (e.key === "ArrowUp") {
    e.preventDefault()
    focusedIndex.value = (focusedIndex.value - 1 + list.length) % list.length
  } else if (e.key === "Enter" && list[focusedIndex.value]) {
    e.preventDefault()
    handleSelect(list[focusedIndex.value].id)
  } else if (e.key === "Escape") {
    open.value = false
  }
}

watch(open, (isOpen) => {
  if (isOpen) {
    searchTerm.value = ""
    focusedIndex.value = 0
    setTimeout(() => inputRef.value?.focus(), 50)
  } else emit("close")
})

defineOptions({ name: "AddCategoryModal" })
</script>

<template>
  <div
    v-if="open"
    class="absolute z-50 mt-1 w-64 rounded-md border border-default bg-white dark:bg-neutral-900 shadow-lg p-2 flex flex-col gap-1"
    @keydown="handleKeyDown"
  >
    <RLVInput
      ref="inputRef"
      v-model="searchTerm"
      leading-icon="i-lucide-search"
      :placeholder="t('page_editor.search_categories', 'Search categories...')"
      color="neutral"
      class="w-full"
    />
    <div
      v-if="filteredCategories.length > 0"
      class="flex flex-col gap-0.5 max-h-48 overflow-y-auto mt-1"
    >
      <button
        v-for="(cat, idx) in filteredCategories"
        :key="cat.id"
        :class="[
          'flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left w-full',
          existingCategories.includes(cat.id) ? 'opacity-40 cursor-not-allowed' : '',
          idx === focusedIndex ? 'bg-neutral-100 dark:bg-neutral-800' : ''
        ]"
        @click="handleSelect(cat.id)"
      >
        <span
          :class="[
            existingCategories.includes(cat.id)
              ? 'i-lucide-check-circle text-green-500'
              : 'i-lucide-folder-plus',
            'size-4 shrink-0 text-dimmed'
          ]"
        />
        <div class="flex-1 min-w-0">
          <div class="truncate">{{ cat.label }}</div>
          <div v-if="cat.description" class="text-xs text-dimmed">{{ cat.description }}</div>
        </div>
      </button>
    </div>
    <div v-else class="text-xs text-dimmed text-center py-4">
      {{ t("page_editor.no_categories_found", "No categories found") }}
    </div>
  </div>
</template>

<style scoped></style>
