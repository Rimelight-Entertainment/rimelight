<script setup lang="ts">
import { computed, ref, watch } from "vue"
import Button from "@/components/base/Button.vue"
import Modal from "@/components/base/Modal.vue"
import Label from "@/components/base/Label.vue"
import Input from "@/components/base/Input.vue"
import { usePageUtils } from "@/composables/usePageUtils"

interface MovePageModalProps {
  isOpen: boolean
  onClose: () => void
  currentSlug: string
  currentPageId: string
  onPageMoved: (newSlug: string) => void
}

const props = defineProps<MovePageModalProps>()

const pageUtils = usePageUtils()

const newSlugPath = ref("")
const errorMessage = ref<string | null>(null)
const isLoading = ref(false)

const originalFilename = computed(() => {
  if (!props.currentSlug) return ""
  const parts = props.currentSlug.split("/")
  return parts[parts.length - 1]
})

watch(
  [() => props.isOpen, () => props.currentSlug],
  ([newIsOpen, newCurrentSlug]) => {
    if (newIsOpen && newCurrentSlug) {
      const lastSlashIndex = newCurrentSlug.lastIndexOf("/")
      newSlugPath.value = lastSlashIndex > -1 ? newCurrentSlug.substring(0, lastSlashIndex) : ""
      errorMessage.value = null
    }
  },
  { immediate: true }
)

const handleSlugPathChange = (event: Event) => {
  newSlugPath.value = (event.target as HTMLInputElement).value
  errorMessage.value = null
}

const handleMovePage = async () => {
  errorMessage.value = null
  isLoading.value = true

  const normalizedNewSlugPath = newSlugPath.value.trim().replace(/^\/|\/$/g, "")
  const targetFullSlug = normalizedNewSlugPath
    ? `${normalizedNewSlugPath}/${originalFilename.value}`
    : originalFilename.value

  if (!normalizedNewSlugPath && originalFilename.value === "") {
    errorMessage.value = "Cannot move a page without a filename to the root."
    isLoading.value = false
    return
  }

  if (targetFullSlug === props.currentSlug) {
    errorMessage.value = "New path must be different from the current path."
    isLoading.value = false
    return
  }

  try {
    const exists = await pageUtils.doesPageExist(targetFullSlug)
    if (exists) {
      errorMessage.value = `A page with slug "${targetFullSlug}" already exists. Please choose a different path.`
      isLoading.value = false
      return
    }

    await pageUtils.movePage(props.currentPageId, originalFilename.value, normalizedNewSlugPath)

    props.onPageMoved(targetFullSlug)
    props.onClose()
  } catch (error) {
    console.error("Failed to move page:", error)
    if (error instanceof Error) {
      errorMessage.value = `Failed to move page: ${error.message}`
    } else {
      errorMessage.value = "Failed to move page due to an unknown error."
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
    title="Move Page"
    description="This will move the page to a new parent directory."
  >
    <Label
      html-for="current-page-slug"
      text="Current Slug"
      tooltip="The current slug for the page."
      :required="false"
    />
    <Input id="current-page-slug" type="text" :value="props.currentSlug" readonly class="mb-lg" />
    <Label
      html-for="new-page-path"
      text="New Parent Path"
      tooltip="The new parent directory for the page. Leave empty for root."
      :required="true"
    />
    <Input
      id="new-page-path"
      type="text"
      v-model="newSlugPath"
      @input="handleSlugPathChange"
      placeholder="games/new-folder"
    />
    <p v-if="errorMessage" class="mt-sm text-sm text-rimelight-danger-500">
      {{ errorMessage }}
    </p>
    <div class="mt-lg flex justify-between gap-md">
      <Button
        variant="danger"
        size="sm"
        text="Cancel"
        @click="props.onClose"
        :disabled="isLoading"
      />
      <Button
        variant="primary"
        size="sm"
        text="Move Page"
        @click="handleMovePage"
        :is-loading="isLoading"
      />
    </div>
  </Modal>
</template>
