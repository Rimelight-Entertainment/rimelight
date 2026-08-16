<script setup lang="ts">
import type { ImageBlockProps } from "@/types/blocks"
import { scv } from "css-variants"

/* region Props */
export interface ImageBlockRendererProps extends ImageBlockProps {}

const { src, alt, caption } = defineProps<ImageBlockRendererProps>()
/* endregion */

/* region Styles */
const imageBlockRendererStyles = scv({
  slots: {
    root: "mx-auto my-6 flex flex-col items-center",
    image: "h-auto max-w-full rounded-xl object-cover border border-default shadow-sm",
    captionClass: "mt-2 text-center text-xs text-dimmed italic"
  }
})

const styles = imageBlockRendererStyles()
/* endregion */

defineOptions({ name: "ImageBlockRenderer" })
</script>

<template>
  <figure :class="styles.root">
    <img :src="src" :alt="alt || 'Image'" :class="styles.image" />
    <figcaption v-if="caption" :class="styles.captionClass">
      {{ caption }}
    </figcaption>
  </figure>
</template>
