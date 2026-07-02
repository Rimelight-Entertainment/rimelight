<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue"
import { CategoryOrder } from "~/config/blocks/blockSchema"
import Icon from "@/components/base/Icon.vue"
import Modal from "@/components/base/Modal.vue"
import type { FlatBlockInfo, GroupedBlocks } from "@/types/Block"

interface PlaceBlockModalProps {
  /**
   * The list of available block types, grouped by category, for rendering.
   */
  groupedBlocks: GroupedBlocks
  /**
   * The flat list of available block types (matching the search term) for navigation index.
   */
  flatBlocks: FlatBlockInfo[]
  /**
   * The index of the currently focused suggestion item within the flatBlocks list.
   */
  focusedIndex: number
  /**
   * The current search term to display in the input field.
   */
  searchTerm: string
  /**
   * Callback function when a suggestion item is selected.
   */
  onSelect: (blockType: string) => void
  /**
   * Callback function to close the menu. (Still used by the Escape key in ParagraphBlock)
   */
  onClose: () => void
  /**
   * Callback function when the search term changes (typing in the input).
   */
  onSearchTermChange: (newTerm: string) => void
  /**
   * Optional position for the menu (e.g., near the caret). If not provided, default styling will
   * center it or position relatively.
   */
  position?: { x: number; y: number }
  /**
   * Optional additional CSS classes to apply to the menu container. In Vue, this is typically
   * handled by `inheritAttrs: false` and binding `$attrs` or passing a `class` prop.
   */
  className?: string
}

const props = defineProps<PlaceBlockModalProps>()

// Refs
const inputRef = ref<HTMLInputElement | null>(null)
const scrollableRef = ref<HTMLDivElement | null>(null)
const rootMenuRef = ref<HTMLDivElement | null>(null)

const hasScrollbar = ref(false)

watch(
  [() => props.focusedIndex, () => props.flatBlocks.length],
  () => {
    let container: HTMLElement | null = null

    if (scrollableRef.value) {
      container = scrollableRef.value
    } else if (rootMenuRef.value) {
      container = rootMenuRef.value
    }

    if (container && props.focusedIndex >= 0 && props.focusedIndex < props.flatBlocks.length) {
      const focusedElement = container.querySelector(
        `[data-flat-index="${props.focusedIndex}"]`
      ) as HTMLElement

      if (focusedElement) {
        focusedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth"
        })
      }
    }
  },
  { flush: "post" }
)

onMounted(() => {
  requestAnimationFrame(() => {
    if (inputRef.value) {
      inputRef.value.focus()
    }
  })
})

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  const checkScrollbar = () => {
    if (scrollableRef.value) {
      hasScrollbar.value = scrollableRef.value.scrollHeight > scrollableRef.value.clientHeight
    }
  }

  checkScrollbar()

  resizeObserver = new ResizeObserver(checkScrollbar)

  if (scrollableRef.value) {
    resizeObserver.observe(scrollableRef.value)
  }
})

onUnmounted(() => {
  if (scrollableRef.value && resizeObserver) {
    resizeObserver.unobserve(scrollableRef.value)
    resizeObserver = null
  }
})

const sortedCategories = computed(() => {
  return Object.keys(props.groupedBlocks).toSorted((a, b) => {
    const aIndex = CategoryOrder.indexOf(a)
    const bIndex = CategoryOrder.indexOf(b)

    if (aIndex > -1 && bIndex > -1) {
      return aIndex - bIndex
    }
    if (aIndex > -1) {
      return -1
    }
    if (bIndex > -1) {
      return 1
    }
    return a.localeCompare(b)
  })
})

const hasBlocksToDisplay = computed(() => props.flatBlocks.length > 0)

const scrollbarPaddingClass = computed(() => (hasScrollbar.value ? "pr-2" : "pr-0"))

defineExpose({
  rootMenuRef
})
</script>

<template>
  <Modal
    :is-open="true"
    @close="props.onClose"
    :disable-backdrop-click="false"
    :is-centered="!props.position"
    :x="props.position?.x ?? null"
    :y="props.position?.y ?? null"
    title="Add Block"
    description="Select the block type to add."
    :prevent-page-scroll="false"
    :content-class="`
      bg-rimelight-primary-700 min-w-128 border border-rimelight-primary-500 z-50 flex flex-col gap-md shadow-lg w-128 h-96 overflow-hidden p-md ${props.className || ''}
    `"
    id="place-block-modal"
  >
    <div
      :ref="
        (el) => {
          rootMenuRef = el as HTMLDivElement
        }
      "
      class="flex h-full flex-col gap-md"
      role="listbox"
      aria-label="Block Suggestions"
      tabindex="0"
      @keydown="
        () => {
          const event = $event as KeyboardEvent
          if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(event.key)) {
            event.preventDefault()
            event.stopPropagation()

            if (event.key === 'Enter') {
              if (props.flatBlocks[props.focusedIndex]) {
                props.onSelect(props.flatBlocks[props.focusedIndex].type)
              }
            } else if (event.key === 'Escape') {
              props.onClose()
            }
          }
          if (!['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(event.key) && inputRef) {
            inputRef.value?.focus()
          }
        }
      "
    >
      <p id="place-block-modal-title" class="text-md font-semibold text-rimelight-primary-100">
        Place Block
      </p>

      <div
        ref="scrollableRef"
        :class="`document-editor-scrollbar flex flex-grow flex-col gap-sm overflow-y-auto ${scrollbarPaddingClass}`"
      >
        <template v-if="hasBlocksToDisplay">
          <div
            v-for="category in sortedCategories"
            :key="category"
            role="group"
            :aria-label="`${category} blocks`"
            class="flex flex-col gap-sm"
          >
            <template
              v-if="props.groupedBlocks[category] && props.groupedBlocks[category].length > 0"
            >
              <div class="text-sm font-semibold text-rimelight-primary-100">
                {{ category }}
              </div>
              <ul class="flex list-none flex-col gap-sm">
                <li
                  v-for="block in props.groupedBlocks[category]"
                  :key="block.type"
                  :data-flat-index="props.flatBlocks.findIndex((b) => b.type === block.type)"
                  :class="`
                    flex cursor-pointer items-center gap-md border border-rimelight-primary-500 bg-rimelight-primary-600 p-md
                    ${props.flatBlocks.findIndex((b) => b.type === block.type) === props.focusedIndex ? 'bg-rimelight-primary-700' : 'hover:bg-rimelight-primary-700'}
                  `"
                  @click="props.onSelect(block.type)"
                  @keydown="
                    ($event) => {
                      const event = $event as KeyboardEvent
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        event.stopPropagation()
                        props.onSelect(block.type)
                      }
                    }
                  "
                  :aria-selected="
                    props.flatBlocks.findIndex((b) => b.type === block.type) === props.focusedIndex
                  "
                  tabindex="-1"
                >
                  <Icon :name="block.icon" size="sm" class="text-rimelight-primary-100" />
                  <div>
                    <div class="text-sm text-rimelight-primary-100">
                      {{ block.displayName }}
                    </div>
                    <div class="text-xs text-rimelight-primary-100">
                      {{ block.tooltip }}
                    </div>
                  </div>
                </li>
              </ul>
            </template>
          </div>
        </template>
        <div v-else class="p-sm text-center text-sm text-rimelight-primary-100">
          No results found.
        </div>
      </div>

      <hr />

      <input
        ref="inputRef"
        type="text"
        :value="props.searchTerm"
        @input="(e) => props.onSearchTermChange((e.target as HTMLInputElement).value)"
        placeholder="Search blocks..."
        class="w-full bg-transparent text-sm text-rimelight-primary-100 placeholder-rimelight-primary-500 outline-none"
        @keydown="
          ($event) => {
            const event = $event as KeyboardEvent
            if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(event.key)) {
              event.preventDefault()
            }
          }
        "
        role="combobox"
        aria-autocomplete="list"
        aria-controls="suggestion-menu-listbox"
        aria-expanded="true"
      />
    </div>
  </Modal>
</template>

<style scoped></style>
