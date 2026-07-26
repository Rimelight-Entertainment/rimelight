<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "../../utils/editorHelpers"
import { getLocalizedContent } from "../../utils/page"

import BlockViewRenderer from "../BlockViewRenderer.vue"

const props = defineProps<{ props: any }>()
const { locale } = useI18n()

const headingTag = computed(() => `h${props.props?.level || 2}`)
const headingClasses = computed(() => {
  switch (Number(props.props?.level || 2)) {
    case 1:
      return "text-3xl font-extrabold tracking-tight mt-8 mb-4 border-b pb-2 text-neutral-900 dark:text-white"
    case 2:
      return "text-2xl font-bold tracking-tight mt-6 mb-3 text-neutral-900 dark:text-white"
    case 3:
      return "text-xl font-semibold mt-4 mb-2 text-neutral-900 dark:text-white"
    default:
      return "text-lg font-medium mt-3 mb-2 text-neutral-900 dark:text-white"
  }
})

const titleText = computed(() => getLocalizedContent(props.props?.title, locale.value))
const descriptionText = computed(() => getLocalizedContent(props.props?.description, locale.value))
const sectionChildren = computed(() => {
  const p = props.props
  if (!p) return []
  return p.children || p.blocks || p.slots?.default || []
})

defineOptions({ name: "SectionBlockRenderer" })
</script>

<template>
  <div class="my-4">
    <component
      :is="headingTag"
      v-if="titleText"
      :class="headingClasses"
      :id="typeof titleText === 'string' ? titleText.toLowerCase().replace(/\s+/g, '-') : undefined"
    >
      {{ titleText }}
    </component>

    <p v-if="descriptionText" class="text-sm text-dimmed mb-4 italic">
      {{ descriptionText }}
    </p>

    <div v-if="sectionChildren && sectionChildren.length" class="flex flex-col gap-2">
      <BlockViewRenderer :blocks="sectionChildren" />
    </div>
  </div>
</template>
