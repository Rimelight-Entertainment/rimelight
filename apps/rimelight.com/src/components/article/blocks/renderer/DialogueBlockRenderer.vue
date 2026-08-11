<script setup lang="ts">
import type { DialogueBlockProps } from "@/types/blocks"

export interface DialogueBlockRendererProps extends DialogueBlockProps {}

defineProps<DialogueBlockRendererProps>()

defineOptions({ name: "DialogueBlockRenderer" })
</script>

<template>
  <div class="my-3 mx-8 max-w-md">
    <div class="text-sm font-bold text-center text-pink-800 dark:text-pink-200">
      {{ character }}
    </div>
    <div v-if="parenthetical" class="text-xs italic text-center text-dimmed mt-0.5">
      ({{ parenthetical }})
    </div>
    <div class="text-sm text-center text-neutral-700 dark:text-neutral-300 mt-1">{{ line }}</div>
  </div>
</template>

<style scoped></style>
