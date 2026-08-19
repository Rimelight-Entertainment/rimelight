<script setup lang="ts">
import { ref, watch, onMounted, inject, nextTick } from "vue"
import { scv } from "css-variants"
import type { ParagraphBlockProps, RichTextContent } from "@/types/blocks"
import { richTextToHtml, parseHtmlToRichText } from "@/utils/richTextHelpers"
import RLVButton from "@rimelight/ui/components/button/RLVButton.vue"

/* region Props */
export interface ParagraphBlockEditorProps extends ParagraphBlockProps {
  id: string
}

const { id, text } = defineProps<ParagraphBlockEditorProps>()
/* endregion */

/* region Emits */
defineEmits<{}>()
/* endregion */

/* region Styles */
const paragraphBlockEditorStyles = scv({
  slots: {
    root: "p-2 outline-none min-h-6 focus:ring-2 focus:ring-blue-500 rounded-md transition duration-150 text-base",
    toolbar:
      "flex items-center gap-1 px-2 py-1 border border-default rounded-t-md bg-neutral-50 dark:bg-neutral-900/50"
  }
})

const styles = paragraphBlockEditorStyles()
/* endregion */

/* region State */
const editorRef = ref<HTMLElement | null>(null)
const localHtml = ref(richTextToHtml(text))
const isContentChanging = ref(false)
const editorApi = inject<any>("block-editor-api")
const showToolbar = ref(false)
/* endregion */

/* region Meta */
defineOptions({ name: "ParagraphBlockEditor" })
/* endregion */

/* region Lifecycle */
onMounted(() => {
  if (editorRef.value) {
    editorRef.value.innerHTML = localHtml.value
  }
})

watch(
  () => text,
  (newContent) => {
    if (
      isContentChanging.value ||
      !editorRef.value ||
      (typeof document !== "undefined" && document.activeElement === editorRef.value)
    ) {
      return
    }
    const newHtml = richTextToHtml(newContent)
    if (editorRef.value.innerHTML !== newHtml) {
      editorRef.value.innerHTML = newHtml
      localHtml.value = newHtml
    }
  },
  { deep: true, immediate: true }
)
/* endregion */

/* region Logic */
const commitContentOnBlur = () => {
  if (!editorRef.value || !editorApi) return
  const rawHtml = editorRef.value.innerText.trim()
  const currentPropText = richTextToHtml(text)
  if (rawHtml === currentPropText) {
    return
  }
  isContentChanging.value = true
  const newRichContent: RichTextContent = parseHtmlToRichText(rawHtml)
  editorApi.updateBlockProps(id, { text: newRichContent })
  nextTick(() => {
    isContentChanging.value = false
  })
}

const execFormat = (command: string, value: string | undefined = undefined) => {
  if (typeof document !== "undefined") {
    document.execCommand(command, false, value)
    if (editorRef.value) editorRef.value.focus()
  }
}

const formatButtons = [
  { icon: "i-lucide-bold", command: "bold", title: "Bold" },
  { icon: "i-lucide-italic", command: "italic", title: "Italic" },
  { icon: "i-lucide-underline", command: "underline", title: "Underline" }
]
/* endregion */
</script>

<template>
  <div class="flex flex-col">
    <div v-if="showToolbar" :class="styles.toolbar">
      <RLVButton
        v-for="btn in formatButtons"
        :key="btn.command"
        variant="ghost"
        color="neutral"
        :leading-icon="btn.icon"
        class="!p-1.5"
        :title="btn.title"
        @click="execFormat(btn.command)"
      />
      <span class="w-px h-4 bg-default mx-1" />
      <RLVButton
        variant="ghost"
        color="neutral"
        leading-icon="i-lucide-link"
        class="!p-1.5"
        title="Insert Link"
        @click="execFormat('createLink', prompt('URL:') || undefined)"
      />
    </div>
    <div
      ref="editorRef"
      contenteditable="true"
      :class="[styles.root, showToolbar ? 'rounded-t-none' : '']"
      @focus="showToolbar = true"
      @blur="commitContentOnBlur"
    ></div>
  </div>
</template>

<style scoped></style>
