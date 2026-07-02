<script setup lang="ts">
import { ref, computed, watch } from "vue"
import Button from "@/components/base/Button.vue"
import Modal from "@/components/base/Modal.vue"
import Label from "@/components/base/Label.vue"
import Input from "@/components/base/Input.vue"
import EditableSelect from "@/components/article/base/EditableSelect.vue"

import { usePageUtils, HttpError } from "@/composables/usePageUtils"
import { PageType } from "@/types/Page"

interface NewPageModalProps {
  isOpen: boolean
  onClose: () => void
  onPageCreated: (slug: string) => void
}

const props = defineProps<NewPageModalProps>()

const pageUtils = usePageUtils()

const slug = ref("")
const title = ref("")
const selectedPageType = ref<PageType>(PageType.DEFAULT)
const errorMessage = ref<string | null>(null)
const isLoading = ref(false)

const modalDialogRef = ref<HTMLDivElement | null>(null)

const pageTypeOptions = computed<readonly PageType[]>(() => Object.values(PageType))

const editableSelectPortalTarget = computed(() => modalDialogRef.value)

watch(
  () => props.isOpen,
  (newIsOpen) => {
    if (newIsOpen) {
      slug.value = ""
      title.value = ""
      selectedPageType.value = PageType.DEFAULT
      errorMessage.value = null
      isLoading.value = false
    }
  }
)

const handleSlugChange = (event: Event) => {
  const inputValue = (event.target as HTMLInputElement).value
  const lowerCaseInput = inputValue.toLowerCase()
  let tempSlug = ""

  const allowedChars = "abcdefghijklmnopqrstuvwxyz0123456789/-"

  for (let i = 0; i < lowerCaseInput.length; i++) {
    const char = lowerCaseInput[i]
    if (allowedChars.includes(char)) {
      tempSlug += char
    }
  }

  slug.value = tempSlug
  errorMessage.value = null
}

const handleTitleChange = (event: Event) => {
  title.value = (event.target as HTMLInputElement).value
  errorMessage.value = null
}

const handlePageTypeChange = (newValue: PageType) => {
  selectedPageType.value = newValue
  errorMessage.value = null
}

const handleCreatePage = async () => {
  let finalSlug = slug.value.trim()

  finalSlug = finalSlug.replace(/\/+/g, "/")
  finalSlug = finalSlug.replace(/^\/|\/$/g, "")

  if (!finalSlug) {
    errorMessage.value = "Page slug cannot be empty."
    return
  }

  if (finalSlug === "/" || finalSlug === "") {
    errorMessage.value = "Invalid slug format. Slug cannot be just '/' or empty after trimming."
    return
  }

  isLoading.value = true
  errorMessage.value = null

  try {
    const exists = await pageUtils.doesPageExist(finalSlug)
    if (exists) {
      errorMessage.value = `A page with slug "${finalSlug}" already exists.`
      isLoading.value = false
      return
    }

    await pageUtils.saveNewPage(
      finalSlug,
      title.value.trim() === "" ? undefined : title.value.trim(),
      selectedPageType.value
    )

    props.onPageCreated(finalSlug)
    props.onClose()
  } catch (error) {
    console.error("Failed to create new page:", error)
    if (error instanceof HttpError) {
      errorMessage.value = `Failed to create page: ${error.message} (Status: ${error.status})`
    } else if (error instanceof Error) {
      errorMessage.value = `Failed to create page: ${error.message}`
    } else {
      errorMessage.value = "An unknown error occurred during page creation."
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Modal
    :is-open="props.isOpen"
    @close="props.onClose"
    title="Create New Page"
    description="Creates a new page at the target slug."
    content-class-name="min-w-96"
    ref="modalDialogRef"
  >
    <Input
      type="text"
      size="sm"
      label="Page Slug"
      label-tooltip="The slug for the new page."
      :required="true"
      placeholder="franchises/grand-tale"
      v-model="slug"
      @input="handleSlugChange"
    />
    <Input
      type="text"
      size="sm"
      label="Page Title"
      label-tooltip="The title for the new page."
      :required="false"
      placeholder="New Page"
      v-model="title"
      @input="handleTitleChange"
    />
    <p v-if="errorMessage" class="text-sm text-rimelight-danger-500">
      {{ errorMessage }}
    </p>
    <Label
      html-for="page-template"
      text="Template"
      tooltip="The page template to use for the new page."
      :required="true"
    />
    <EditableSelect
      block-id="new-page-template-select"
      :value="selectedPageType"
      @update:modelValue="handlePageTypeChange"
      :options="pageTypeOptions"
      :is-editable="true"
      placeholder="Select a template"
      :portal-target="editableSelectPortalTarget"
    />
    <div class="mt-auto flex justify-between gap-md border-t border-rimelight-primary-500 pt-md">
      <Button
        variant="danger"
        size="sm"
        @click="props.onClose"
        :disabled="isLoading"
        text="Cancel"
      />
      <Button
        variant="primary"
        size="sm"
        @click="handleCreatePage"
        :is-loading="isLoading"
        text="Create"
      />
    </div>
  </Modal>
</template>
