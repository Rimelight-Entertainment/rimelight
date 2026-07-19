<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "../../utils/editorHelpers"
import { getLocalizedContent } from "../../utils/page"

const props = defineProps<{ node: any }>()
const { locale } = useI18n()

const href = computed(() => props.node?.props?.href || props.node?.href || props.node?.to || "#")
const target = computed(() => props.node?.props?.target || props.node?.target || "_self")
const contentText = computed(() => {
  const n = props.node
  const val = n?.props?.content ?? n?.content ?? n?.label ?? href.value
  return getLocalizedContent(val, locale.value)
})

defineOptions({ name: "LinkNode" })
</script>

<template>
  <a
    :href="href"
    :target="target"
    class="text-primary underline hover:text-primary-600 transition-colors"
  >
    {{ contentText }}
  </a>
</template>
