<script setup lang="ts">
import type { ImageBlockProps } from "../../types/blocks"

defineProps<{ props: ImageBlockProps }>()
defineOptions({ name: "ImageBlockRenderer" })
</script>

<template>
  <figure class="my-6 flex flex-col items-center">
    <img
      v-if="props.src"
      :src="props.src"
      :alt="props.alt || ''"
      class="rounded-xl border border-default shadow-md max-w-full h-auto object-cover max-h-[500px]"
    />
    <figcaption v-if="props.caption" class="text-xs text-dimmed mt-2 text-center italic">
      {{ props.caption }}
    </figcaption>
  </figure>
</template>
