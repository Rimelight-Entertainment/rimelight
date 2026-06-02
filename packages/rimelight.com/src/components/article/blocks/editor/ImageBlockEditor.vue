<script setup lang="ts">
import { ref, watch, computed, onUnmounted } from "vue"
import { scv, cx } from "css-variants"
import { useRC } from "~/composables"
import type { ImageBlockProps } from "~/types/blocks"
import RLVInput from "@rimelight/ui/components/vue/RLVInput.vue"
import RLVFormField from "@rimelight/ui/components/vue/RLVFormField.vue"

/* region Props */
export interface ImageBlockEditorProps extends ImageBlockProps {
  rc?: {
    root?: string
    upload?: string
    previewContainer?: string
    previewImage?: string
    emptyPreview?: string
  }
}

const { src, alt, caption, rc: rcProp } = defineProps<ImageBlockEditorProps>()

const { rc } = useRC("ImageBlockEditor", rcProp)
/* endregion */

/* region Emits */
export interface ImageBlockEditorEmits {
  "update:src": [value: string | null]
  "update:alt": [value: string]
  "update:caption": [value: string | null]
  "update:file": [value: File | null]
}

const emit = defineEmits<ImageBlockEditorEmits>()
/* endregion */

/* region Styles */
const imageBlockEditorStyles = scv({
  slots: {
    root: "flex flex-col gap-4",
    upload: "w-full",
    previewContainer: "relative aspect-video w-full overflow-hidden rounded-md border border-default bg-neutral-50 dark:bg-neutral-900/50",
    previewImage: "size-full object-cover",
    emptyPreview: "flex size-full items-center justify-center bg-muted text-dimmed"
  }
})

const styles = computed(() => {
  const resolved = imageBlockEditorStyles()
  const result: Record<string, string> = {}
  for (const [slot, value] of Object.entries(resolved)) {
    result[slot] = cx(value, (rc.value as Record<string, string>)[slot])
  }
  return result as {
    root: string
    upload: string
    previewContainer: string
    previewImage: string
    emptyPreview: string
  }
})
/* endregion */

/* region State */
const fileToUpload = ref<File | null>(null)
const localAlt = ref(alt || "")
const localCaption = ref(caption || "")

// Custom lightweight URL object hook
const filePreviewUrl = ref<string | null>(null)

watch(fileToUpload, (newFile) => {
  if (filePreviewUrl.value) {
    URL.revokeObjectURL(filePreviewUrl.value)
    filePreviewUrl.value = null
  }
  if (newFile) {
    filePreviewUrl.value = URL.createObjectURL(newFile)
  }
})

onUnmounted(() => {
  if (filePreviewUrl.value) {
    URL.revokeObjectURL(filePreviewUrl.value)
  }
})

const previewSrc = computed(() => {
  return fileToUpload.value ? filePreviewUrl.value : src
})
/* endregion */

/* region Meta */
defineOptions({
  name: "ImageBlockEditor"
})
/* endregion */

/* region Lifecycle */
watch(() => localAlt.value, (newAlt) => {
  emit("update:alt", newAlt)
})

watch(() => localCaption.value, (newCaption) => {
  emit("update:caption", newCaption)
})

watch(fileToUpload, (newFile) => {
  emit("update:file", newFile)
  if (newFile) {
    emit("update:src", null)
  }
})
/* endregion */

/* region Logic */
const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files?.length) {
    fileToUpload.value = target.files[0] ?? null
  }
}
/* endregion */
</script>

<template>
  <div :class="styles.root">
    <div :class="styles.previewContainer">
      <img
        v-if="previewSrc"
        :src="previewSrc"
        :class="styles.previewImage"
        alt="Preview"
      />
      <div v-else :class="styles.emptyPreview">
        <span class="i-lucide-image size-12 opacity-60" />
      </div>
    </div>

    <input
      type="file"
      accept="image/*"
      class="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-neutral-800 dark:file:text-neutral-200"
      @change="onFileChange"
    />

    <RLVFormField label="Alt Text">
      <RLVInput v-model="localAlt" placeholder="Describe the image..." class="w-full" />
    </RLVFormField>

    <RLVFormField label="Caption">
      <RLVInput v-model="localCaption" placeholder="Add a caption..." class="w-full" />
    </RLVFormField>
  </div>
</template>

<style scoped></style>
