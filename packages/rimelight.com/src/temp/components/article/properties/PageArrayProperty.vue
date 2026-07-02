<script setup lang="ts">
import { ref, watch, computed } from "vue"
import Label from "@/components/base/Label.vue"
import Button from "@/components/base/Button.vue"
import LayoutBox from "@/components/base/LayoutBox.vue"
import LinkPageModal from "@/components/article/modals/LinkPageModal.vue"
import { usePageUtils } from "@/composables/usePageUtils" // Using usePageUtils composable
import type { PageType } from "@/types/Page" // Ensure correct import for PageType
import { NuxtLink } from "#components" // Correct way to import NuxtLink in script setup

interface PageArrayPropertyProps {
  label: string
  // In Vue, for v-model, the primary prop is typically 'modelValue'.
  // We will keep 'value' for clarity and emit 'update:modelValue'.
  value: string[] | undefined
  isEditable: boolean
  // Replaced by 'update:modelValue' emit
  // onValueChange?: (newValue: string[] | undefined) => void;
  allowedPageTypes?: PageType[]
}

interface PageDisplayItem {
  slug: string
  name: string | null
}

const props = defineProps<PageArrayPropertyProps>()

// Define the emit for v-model support
const emit = defineEmits<{
  (e: "update:modelValue", newValue: string[] | undefined): void
}>()

const pageUtils = usePageUtils()

const internalValues = ref<string[]>([])
const displayItems = ref<PageDisplayItem[]>([])
const isModalOpen = ref(false)

// Watch for changes in the `value` prop and update `internalValues`
watch(
  () => props.value,
  (newValue) => {
    const cleanedValue = Array.isArray(newValue)
      ? newValue.filter((s): s is string => typeof s === "string")
      : []
    console.log("PageArrayProperty: Prop 'value' changed. Cleaned value:", cleanedValue)
    internalValues.value = cleanedValue
  },
  { immediate: true, deep: true } // Run immediately on component setup, deep watch for array changes
)

// Watch for changes in `internalValues` to fetch page names
watch(
  internalValues,
  async (newInternalValues) => {
    console.log("PageArrayProperty: Fetching names for internalValues:", newInternalValues)
    if (newInternalValues.length > 0) {
      const items: PageDisplayItem[] = await Promise.all(
        newInternalValues.map(async (currentSlugFromState) => {
          if (!currentSlugFromState || currentSlugFromState === "[object Object]") {
            console.error(
              "PageArrayProperty: Invalid slug in internalValues detected during fetchPageNames:",
              currentSlugFromState
            )
            return { slug: "invalid-slug", name: "ERROR: Invalid Slug" }
          }

          try {
            const name = await pageUtils.getPageNameBySlug(currentSlugFromState)
            console.log(`PageArrayProperty: Fetched name for slug "${currentSlugFromState}":`, name)
            return { slug: currentSlugFromState, name }
          } catch (error) {
            console.error(`Error fetching name for slug ${currentSlugFromState}:`, error)
            return { slug: currentSlugFromState, name: "Error fetching name" }
          }
        })
      )
      console.log("PageArrayProperty: Setting displayItems:", items)
      displayItems.value = items
    } else {
      displayItems.value = []
    }
  },
  { immediate: true, deep: true } // Run immediately, deep watch for array changes
)

const handleAddItem = (newSlug: string) => {
  console.log(
    "PageArrayProperty: handleAddItem called with newSlug:",
    newSlug,
    "Type:",
    typeof newSlug
  )
  if (!newSlug || newSlug === "" || newSlug === "[object Object]") {
    console.error("PageArrayProperty: handleAddItem received invalid newSlug:", newSlug)
    return
  }
  if (internalValues.value.includes(newSlug)) {
    console.warn(`Page with slug "${newSlug}" is already in the list.`)
    return
  }
  const updatedValues = [...internalValues.value, newSlug]
  console.log("PageArrayProperty: Updating internalValues (add):", updatedValues)
  internalValues.value = updatedValues // Update ref
  emit("update:modelValue", updatedValues) // Emit to parent
}

const handleRemoveItem = (slugToRemove: string) => {
  console.log("PageArrayProperty: handleRemoveItem called with slugToRemove:", slugToRemove)
  const updatedValues = internalValues.value.filter((slug) => slug !== slugToRemove)
  console.log("PageArrayProperty: Updating internalValues (remove):", updatedValues)
  internalValues.value = updatedValues // Update ref
  emit("update:modelValue", updatedValues) // Emit to parent
}

const openModal = () => {
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

// Computed property to determine if the component should render
const shouldRender = computed(() => {
  return (internalValues.value && internalValues.value.length > 0) || props.isEditable
})
</script>

<template>
  <template v-if="shouldRender">
    <dt class="flex flex-row items-center">
      <Label :text="props.label" />
      <Button
        v-if="props.isEditable"
        type="button"
        @click="openModal"
        variant="primary"
        size="xs"
        start-icon="add"
        title="Add page"
        class="ml-auto"
      />
    </dt>
    <dd>
      <ul v-if="displayItems.length > 0">
        <li v-for="item in displayItems" :key="item.slug" class="mb-2 last:mb-0">
          <LayoutBox direction="horizontal" gap="sm" class-name="items-center">
            <NuxtLink
              v-if="item.slug && item.slug !== 'invalid-slug'"
              :to="`/${item.slug}`"
              class="flex-grow truncate text-sm text-rimelight-secondary-500 underline"
            >
              {{ item.name || item.slug }}
            </NuxtLink>
            <span v-else class="flex-grow truncate text-sm text-rimelight-primary-500">
              {{ item.name || item.slug }}
            </span>
            <Button
              v-if="props.isEditable"
              type="button"
              @click="handleRemoveItem(item.slug)"
              variant="danger"
              size="xs"
              start-icon="delete"
              title="Remove page"
            />
          </LayoutBox>
        </li>
      </ul>
      <span v-else-if="props.isEditable" class="italic text-sm text-rimelight-primary-500">
        (No pages, click &#39;+&#39; to add)
      </span>
    </dd>
    <LinkPageModal
      :is-open="isModalOpen"
      @close="closeModal"
      @select-page="handleAddItem"
      :allowed-page-types="props.allowedPageTypes"
    />
  </template>
</template>
