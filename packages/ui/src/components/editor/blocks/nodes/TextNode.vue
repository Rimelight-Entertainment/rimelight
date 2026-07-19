<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "../../utils/editorHelpers"
import { getLocalizedContent } from "../../utils/page"

const props = defineProps<{ node: any }>()
const { locale } = useI18n()

const textContent = computed(() => {
  const n = props.node
  if (!n) return ""
  if (typeof n === "string") return n
  const val = n.props?.content ?? n.content ?? n.text ?? n.value
  return getLocalizedContent(val, locale.value)
})

defineOptions({ name: "TextNode" })
</script>

<template>
  <span>{{ textContent }}</span>
</template>
