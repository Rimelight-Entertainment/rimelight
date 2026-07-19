<script setup lang="ts">
import { computed } from "vue"
import TextRenderer from "../TextRenderer.vue"

const props = defineProps<{ props: any }>()
const textContent = computed(() => {
  const p = props.props
  if (!p) return ""
  return p.text ?? p.content ?? p.value ?? ""
})

defineOptions({ name: "ParagraphBlockRenderer" })
</script>

<template>
  <p
    class="text-base text-neutral-800 dark:text-neutral-200 leading-relaxed my-2 whitespace-pre-wrap"
  >
    <TextRenderer :content="textContent" />
  </p>
</template>
