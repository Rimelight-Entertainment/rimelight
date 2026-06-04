<script setup lang="ts">
import { computed } from "vue"
import type { SectionBlockProps } from "@/types/blocks"
import { scv, cx } from "css-variants"
import { useRC } from "@/composables"
import BlockViewRenderer from "../BlockViewRenderer.vue"

/* region Props */
export interface SectionBlockRendererProps extends SectionBlockProps {
  rc?: {
    root?: string
  }
}

const {
  level = 2,
  title,
  description,
  children = [],
  rc: rcProp
} = defineProps<SectionBlockRendererProps>()
const { rc } = useRC("SectionBlockRenderer", rcProp)
/* endregion */

/* region Styles */
const sectionBlockRendererStyles = scv({
  slots: {
    root: "my-6 scroll-mt-20"
  }
})

const styles = computed(() => {
  const resolved = sectionBlockRendererStyles()
  const result: Record<string, string> = {}
  for (const [slot, value] of Object.entries(resolved)) {
    result[slot] = cx(value, (rc.value as Record<string, string>)[slot])
  }
  return result as Record<string, string>
})
/* endregion */

/* region State */
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
}

const headingId = computed(() => (title ? slugify(title) : undefined))
const hasChildren = computed(() => children && children.length > 0)
const headingClasses: Record<number, string> = {
  1: "text-4xl font-extrabold text-neutral-900 dark:text-white mt-8 mb-4",
  2: "text-3xl font-bold text-neutral-900 dark:text-white mt-6 mb-3 border-b border-default pb-2",
  3: "text-2xl font-semibold text-neutral-900 dark:text-white mt-5 mb-2.5",
  4: "text-xl font-medium text-neutral-900 dark:text-white mt-4 mb-2",
  5: "text-lg font-medium text-neutral-800 dark:text-neutral-200 mt-3 mb-1.5",
  6: "text-base font-normal text-neutral-700 dark:text-neutral-300 mt-2 mb-1"
}
/* endregion */

defineOptions({ name: "SectionBlockRenderer" })
</script>

<template>
  <section :id="headingId" :class="styles.root">
    <component :is="`h${level}`" :class="headingClasses[level] || headingClasses[2]">
      {{ title }}
    </component>
    <p v-if="description" class="text-sm text-dimmed mt-1 mb-4 italic">
      {{ description }}
    </p>
    <div class="mt-4">
      <BlockViewRenderer v-if="hasChildren" :blocks="children" />
    </div>
  </section>
</template>
