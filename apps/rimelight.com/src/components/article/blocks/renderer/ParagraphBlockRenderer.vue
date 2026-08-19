<script setup lang="ts">
import type { ParagraphBlockProps } from "@/types/blocks"
import TextRenderer from "../TextRenderer.vue"
import { scv } from "css-variants"

/* region Props */
export interface ParagraphBlockRendererProps extends ParagraphBlockProps {}

const { text } = defineProps<ParagraphBlockRendererProps>()
/* endregion */

/* region Styles */
const paragraphBlockRendererStyles = scv({
  slots: {
    root: "text-neutral-700 dark:text-neutral-300 leading-relaxed my-2"
  }
})

const styles = paragraphBlockRendererStyles()
/* endregion */

defineOptions({ name: "ParagraphBlockRenderer" })
</script>

<template>
  <div :class="styles.root">
    <TextRenderer :content="text" />
  </div>
</template>
