<script setup lang="ts">
import { ref, watch, onMounted } from "vue"
import Icon from "@/components/base/Icon.vue"
import Modal from "@/components/base/Modal.vue"
import { PageCategory } from "@/types/Page"

interface CategoryInfo {
  value: PageCategory
  label: string
}

interface CategoryMenuProps {
  availableCategories: CategoryInfo[]
  focusedIndex: number
  searchTerm: string
  onSelect: (category: PageCategory) => void
  onClose: () => void
  onSearchTermChange: (term: string) => void
  position: { x: number; y: number }
}

const props = defineProps<CategoryMenuProps>()

// Use refs for DOM elements
const listboxRef = ref<HTMLDivElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

// Watch for focusedIndex changes to scroll the item into view
watch(
  () => props.focusedIndex,
  (newIndex) => {
    if (newIndex >= 0 && listboxRef.value) {
      const focusedItem = listboxRef.value.children[newIndex] as HTMLElement
      if (focusedItem) {
        focusedItem.scrollIntoView({ block: "nearest" })
      }
    }
  },
  { flush: "post" } // Ensure watch runs after DOM updates
)

// Focus the input field when the component is mounted
onMounted(() => {
  if (inputRef.value) {
    inputRef.value.focus()
  }
})

const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case "ArrowDown":
      event.preventDefault()
      if (props.availableCategories.length > 0) {
        props.onSelect(
          props.availableCategories[(props.focusedIndex + 1) % props.availableCategories.length]
            .value
        )
      }
      break
    case "ArrowUp":
      event.preventDefault()
      if (props.availableCategories.length > 0) {
        props.onSelect(
          props.availableCategories[
            (props.focusedIndex - 1 + props.availableCategories.length) %
              props.availableCategories.length
          ].value
        )
      }
      break
    case "Enter":
      event.preventDefault()
      if (props.focusedIndex >= 0 && props.availableCategories[props.focusedIndex]) {
        props.onSelect(props.availableCategories[props.focusedIndex].value)
      }
      break
    case "Escape":
      event.preventDefault()
      props.onClose()
      break
    default:
      // If a single character key is pressed, ensure input is focused
      // This is often handled by default browser behavior, but explicit focus can be added.
      // Removed the explicit focus on single char key press as it might interfere with other behaviors.
      break
  }
}
</script>

<template>
  <Modal
    :is-open="true"
    @close="props.onClose"
    :is-centered="false"
    :x="props.position.x"
    :y="props.position.y"
    title=""
    description=""
    content-class-name="flex flex-col rounded-md shadow-lg overflow-hidden w-[300px] max-h-[400px]"
  >
    <div class="flex flex-row items-center gap-sm border-b border-rimelight-primary-700 p-sm">
      <Icon name="search" size="sm" class="text-rimelight-primary-500" />
      <input
        ref="inputRef"
        type="text"
        :value="props.searchTerm"
        @input="props.onSearchTermChange(($event.target as HTMLInputElement).value)"
        placeholder="Search categories..."
        class="w-full bg-transparent text-sm text-rimelight-primary-100 placeholder-rimelight-primary-500 outline-none"
        @keydown="handleKeyDown"
        role="combobox"
        aria-autocomplete="list"
        aria-controls="category-menu-listbox"
        aria-expanded="true"
      />
    </div>
    <div
      ref="listboxRef"
      role="listbox"
      id="category-menu-listbox"
      tabindex="-1"
      class="flex-1 overflow-y-auto"
    >
      <div
        v-if="props.availableCategories.length === 0"
        class="p-md text-sm text-rimelight-primary-500"
      >
        No categories found.
      </div>
      <div
        v-for="(category, index) in props.availableCategories"
        :key="category.value"
        role="option"
        :aria-selected="index === props.focusedIndex"
        :class="[
          'cursor-pointer px-md py-sm text-sm',
          index === props.focusedIndex
            ? 'bg-rimelight-primary-600 text-rimelight-primary-50'
            : 'text-rimelight-primary-100 hover:bg-rimelight-primary-700'
        ]"
        @click="props.onSelect(category.value)"
      >
        {{ category.label }}
      </div>
    </div>
  </Modal>
</template>
