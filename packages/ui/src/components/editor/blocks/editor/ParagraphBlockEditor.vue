<script setup lang="ts">
import { computed } from "vue"
import type { ParagraphBlockProps } from "../../types/blocks"
import { richTextToHtml, parseHtmlToRichText } from "../../utils/richTextHelpers"

const props = defineProps<{ props: ParagraphBlockProps }>()
const emit = defineEmits<{ "update:props": [value: ParagraphBlockProps] }>()

const textValue = computed({
  get: () => richTextToHtml(props.props?.text || []),
  set: (val: string) => {
    emit("update:props", {
      ...props.props,
      text: parseHtmlToRichText(val)
    })
  }
})

defineOptions({ name: "ParagraphBlockEditor" })
</script>

<template>
  <div class="w-full">
    <textarea
      v-model="textValue"
      placeholder="Type paragraph text here..."
      rows="3"
      class="w-full p-3 bg-white dark:bg-neutral-900 border border-default rounded-lg text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary resize-y"
    />
  </div>
</template>
