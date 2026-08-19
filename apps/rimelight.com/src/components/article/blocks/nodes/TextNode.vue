<script setup lang="ts">
import { scv } from "css-variants"

/* region Props */
export interface TextNodeProps {
  content: string
}

const { content } = defineProps<TextNodeProps>()
/* endregion */

/* region Styles */
const textNodeStyles = scv({
  slots: { root: "" }
})

const styles = textNodeStyles()
/* endregion */

/* region Meta */
defineOptions({ name: "TextNode" })
/* endregion */
</script>

<template>
  <span :class="styles.root">{{ content }}</span>
</template>
