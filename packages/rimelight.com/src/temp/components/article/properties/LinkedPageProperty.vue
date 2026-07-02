<script setup lang="ts">
import { computed, ref, watch } from "vue"
import Label from "@/components/base/Label.vue"
import Button from "@/components/base/Button.vue"
import LayoutBox from "@/components/base/LayoutBox.vue"
import { usePageUtils } from "@/composables/usePageUtils"
import type { PageType } from "@/types/Page"
import { NuxtLink } from "#components"
import LinkPageModal from "@/components/article/modals/LinkPageModal.vue"

interface PagePropertyProps {
  label: string
  value: string | undefined
  isEditable: boolean
  allowedPageTypes?: PageType[]
}

const props = defineProps<PagePropertyProps>()

const emit = defineEmits<{
  (e: "update:modelValue", newValue: string | undefined): void
}>()

const pageUtils = usePageUtils()

const internalValue = ref<string | undefined>(props.value)
const pageName = ref<string | null>(null)
const isModalOpen = ref(false)

watch(
  () => props.value,
  (newValue) => {
    internalValue.value = newValue
  },
  { immediate: true }
)

watch(
  internalValue,
  async (newValue) => {
    if (newValue) {
      try {
        pageName.value = await pageUtils.getPageNameBySlug(newValue)
      } catch (error) {
        console.error("Error fetching page name:", error)
        pageName.value = null
      }
    } else {
      pageName.value = null
    }
  },
  { immediate: true }
)

const handleSelectPage = (slug: string) => {
  internalValue.value = slug
  emit("update:modelValue", slug)
}

const handleClearPage = () => {
  internalValue.value = undefined
  emit("update:modelValue", undefined)
}

const openModal = () => {
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const shouldRender = computed(() => {
  return (internalValue.value && pageName.value) || props.isEditable
})
</script>

<template>
  <template v-if="shouldRender">
    <dt class="flex flex-row items-center">
      <Label :text="props.label" />
    </dt>
    <dd>
      <template v-if="internalValue && pageName">
        <LayoutBox direction="horizontal" gap="sm" class-name="items-center">
          <NuxtLink
            :to="`/${String(internalValue)}`"
            class="flex-grow truncate text-sm text-rimelight-secondary-500 underline"
          >
            {{ pageName }}
          </NuxtLink>
          <template v-if="props.isEditable">
            <Button
              type="button"
              @click="openModal"
              variant="primary"
              size="xs"
              start-icon="edit"
              title="Change page"
            />
            <Button
              type="button"
              @click="handleClearPage"
              variant="danger"
              size="xs"
              start-icon="delete"
              title="Remove page"
            />
          </template>
        </LayoutBox>
      </template>
      <template v-else-if="props.isEditable">
        <LayoutBox direction="horizontal" gap="sm" class-name="items-center">
          <span class="italic text-sm text-rimelight-primary-500">None</span>
          <Button
            type="button"
            @click="openModal"
            variant="primary"
            size="xs"
            start-icon="add"
            title="Select page"
            class="ml-auto"
          />
        </LayoutBox>
      </template>
    </dd>

    <LinkPageModal
      :is-open="isModalOpen"
      @close="closeModal"
      @select-page="handleSelectPage"
      :allowed-page-types="props.allowedPageTypes"
    />
  </template>
</template>
