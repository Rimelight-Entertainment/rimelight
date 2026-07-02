<script setup lang="ts">
import { ref, computed } from "vue"
import Modal from "@/components/base/Modal.vue"
import Button from "@/components/base/Button.vue"
import { PageType } from "@/types/Page"
import { pageTemplates } from "@/data/templates/pageTemplates"
import EditableSelect from "@/components/article/base/EditableSelect.vue"
import LayoutBox from "@/components/base/LayoutBox.vue"

interface ConvertPageModalProps {
  isOpen: boolean
  onClose: () => void
  onConvert: (targetPageType: PageType) => void
}

const props = defineProps<ConvertPageModalProps>()

const selectedPageType = ref<PageType | null>(null)

const selectBlockId = "convert-page-select-id"

const modalDialogRef = ref<HTMLDialogElement | null>(null)

const availablePageTypeOptions = computed(() => {
  return Object.values(PageType)
    .filter((type) => type !== PageType.DEFAULT)
    .map((type) => ({
      value: type,
      label: pageTemplates[type]?.defaultTitle || type
    }))
})

const handleConvertClick = () => {
  if (selectedPageType.value) {
    props.onConvert(selectedPageType.value)
    selectedPageType.value = null
  }
}

const handleSelectChange = (newValue: string) => {
  selectedPageType.value = newValue as PageType
}
</script>

<template>
  <Modal
    :is-open="props.isOpen"
    @close="props.onClose"
    title="Convert Page"
    description=""
    :ref="
      (el) => {
        modalDialogRef = el as HTMLDialogElement
      }
    "
  >
    <EditableSelect
      :value="selectedPageType || ''"
      :options="availablePageTypeOptions.map((option) => option.value)"
      @update:value="handleSelectChange"
      :is-editable="true"
      placeholder="Select Page Type to Convert"
      alignment="start"
      class="w-full text-sm"
      :block-id="selectBlockId"
      :portal-target="modalDialogRef"
    />
    <LayoutBox justify-content="end" gap="sm">
      <Button variant="primary" size="sm" text="Cancel" @click="props.onClose" />
      <Button
        variant="primary"
        size="sm"
        text="Convert"
        @click="handleConvertClick"
        :disabled="!selectedPageType"
      />
    </LayoutBox>
  </Modal>
</template>

<style scoped></style>
