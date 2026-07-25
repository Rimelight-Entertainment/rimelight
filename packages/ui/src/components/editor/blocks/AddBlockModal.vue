<script setup lang="ts">
import { ref, computed, inject } from "vue"
import { BLOCK_DEFINITIONS, CATEGORY_ORDER, type BlockDefinition } from "../utils/blocks"
import { useI18n } from "../utils/editorHelpers"
import { scv, cx } from "css-variants"
import { SECTION_LEVEL_KEY } from "../composables/injectionKeys"
import RLVButton from "../../button/RLVButton.vue"
import RLVInput from "../../input/RLVInput.vue"

export interface AddBlockModalProps {}
defineProps<AddBlockModalProps>()

export interface AddBlockModalEmits {
  select: [definition: BlockDefinition]
}
const emit = defineEmits<AddBlockModalEmits>()

const addBlockModalStyles = scv({
  slots: [
    "header",
    "headerTitle",
    "closeButton",
    "body",
    "search",
    "categoryList",
    "categoryHeader",
    "blockGrid",
    "blockItem",
    "blockIcon",
    "blockLabel",
    "blockDescription",
    "footerClass",
    "typeBadge",
    "emptyState"
  ],
  base: {
    header: "flex items-center justify-between px-4 py-3 border-b border-default",
    headerTitle: "text-base font-semibold leading-6",
    closeButton: "-my-1",
    body: "p-0 max-h-[70vh] flex flex-col overflow-hidden",
    search: "p-4 border-b border-default",
    categoryList: "overflow-y-auto flex-1 p-4 space-y-6 max-h-[50vh]",
    categoryHeader: "text-xs font-bold text-dimmed uppercase tracking-wider mb-3",
    blockGrid: "flex flex-col gap-2",
    blockItem:
      "flex items-start gap-3 p-3 rounded-lg border border-default hover:border-primary hover:bg-primary-50 dark:hover:bg-primary-950/20 transition-all cursor-pointer text-left w-full",
    blockIcon:
      "w-10 h-10 flex items-center justify-center rounded-md bg-neutral-100 dark:bg-neutral-900 text-neutral-500 group-hover:text-primary shrink-0",
    blockLabel: "font-medium text-sm block text-default",
    blockDescription: "text-xs text-dimmed block mt-0.5",
    footerClass: "flex justify-end gap-2 p-4 border-t border-default",
    typeBadge:
      "text-[10px] font-mono text-dimmed px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-900 rounded shrink-0",
    emptyState: "flex flex-col items-center justify-center py-12 text-center"
  }
})
const styles = computed(() => addBlockModalStyles())

const open = defineModel<boolean>("open", { default: false })
const { t } = useI18n()
const searchQuery = ref("")
const sectionLevel = inject(
  SECTION_LEVEL_KEY,
  computed(() => 1)
)
const filteredBlocks = computed(() => {
  let blocks = BLOCK_DEFINITIONS
  if (sectionLevel.value >= 6) {
    blocks = blocks.filter((b) => b.type !== "SectionBlock")
  }
  if (!searchQuery.value) return blocks
  const query = searchQuery.value.toLowerCase()
  return blocks.filter(
    (block) =>
      t(block.label).toLowerCase().includes(query) ||
      block.type.toLowerCase().includes(query) ||
      block.category.toLowerCase().includes(query) ||
      (block.description && t(block.description).toLowerCase().includes(query))
  )
})
const groupedBlocks = computed(() => {
  const groups: Record<string, BlockDefinition[]> = {}
  filteredBlocks.value.forEach((block) => {
    const category = block.category
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category]!.push(block)
  })
  const sortedGroups: Record<string, BlockDefinition[]> = {}
  CATEGORY_ORDER.forEach((category) => {
    if (groups[category]) {
      sortedGroups[category] = groups[category]!
    }
  })
  Object.keys(groups).forEach((category) => {
    if (!sortedGroups[category]) {
      sortedGroups[category] = groups[category]!
    }
  })
  return sortedGroups
})

const handleSelect = (block: BlockDefinition) => {
  emit("select", block)
  open.value = false
}

defineOptions({ name: "AddBlockModal" })
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
      <div :class="styles.header">
        <h3 :class="styles.headerTitle">
          {{ t("page_editor.add_block", "Add Block") }}
        </h3>
        <RLVButton
          color="neutral"
          variant="ghost"
          leading-leading-icon="i-lucide-x"
          class="!p-1.5"
          :class="styles.closeButton"
          @click="open = false"
        />
      </div>
      <div :class="styles.body">
        <div :class="styles.search">
          <RLVInput
            v-model="searchQuery"
            leading-icon="i-lucide-search"
            :placeholder="t('page_editor.search_blocks', 'Search blocks...')"
            autofocus
            color="neutral"
            class="w-full"
          />
        </div>
        <div :class="styles.categoryList">
          <template v-if="Object.keys(groupedBlocks).length > 0">
            <div v-for="(blocksList, category) in groupedBlocks" :key="category" class="space-y-3">
              <h4 :class="styles.categoryHeader">
                {{ category }}
              </h4>
              <div :class="styles.blockGrid">
                <button
                  v-for="block in blocksList"
                  :key="block.type"
                  :class="styles.blockItem"
                  @click="handleSelect(block)"
                >
                  <span :class="styles.blockIcon">
                    <span :class="block.icon" class="size-5 shrink-0" />
                  </span>
                  <span class="flex-1 text-left">
                    <span class="flex items-center justify-between gap-2">
                      <span :class="styles.blockLabel">
                        {{ t(block.label, block.type) }}
                      </span>
                      <span :class="styles.typeBadge">
                        {{ block.type }}
                      </span>
                    </span>
                    <span v-if="block.description" :class="styles.blockDescription">
                      {{ t(block.description, "") }}
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </template>
          <div v-else :class="styles.emptyState">
            <span class="i-lucide-search-slash size-10 text-neutral-400 mb-4" />
            <p class="text-dimmed">
              {{ t("page_editor.no_blocks_found", "No blocks found") }}
            </p>
          </div>
        </div>
      </div>
      <div :class="styles.footerClass">
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
