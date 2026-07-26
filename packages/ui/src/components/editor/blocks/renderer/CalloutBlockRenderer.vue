<script setup lang="ts">
import { computed } from "vue"
import BlockViewRenderer from "../BlockViewRenderer.vue"

const props = defineProps<{ props: any }>()

const calloutProps = computed(() => props.props || {})
const calloutChildren = computed(() => {
  const p = props.props
  if (!p) return []
  return p.children || p.blocks || p.slots?.default || []
})

const variantClasses = computed(() => {
  switch (calloutProps.value.variant) {
    case "success":
      return "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300"
    case "warning":
      return "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
    case "error":
      return "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300"
    case "commentary":
      return "bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300"
    case "ideation":
      return "bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-300"
    case "source":
      return "bg-neutral-500/10 border-neutral-500/30 text-neutral-700 dark:text-neutral-300"
    default:
      return "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300"
  }
})

const iconName = computed(() => {
  switch (calloutProps.value.variant) {
    case "success":
      return "i-lucide-check-circle"
    case "warning":
      return "i-lucide-alert-triangle"
    case "error":
      return "i-lucide-alert-circle"
    case "commentary":
      return "i-lucide-message-square"
    case "ideation":
      return "i-lucide-lightbulb"
    case "source":
      return "i-lucide-file-code"
    default:
      return "i-lucide-info"
  }
})

defineOptions({ name: "CalloutBlockRenderer" })
</script>

<template>
  <div class="p-4 rounded-xl border flex gap-3 my-4 backdrop-blur-sm" :class="variantClasses">
    <span :class="[iconName, 'size-5 shrink-0 mt-0.5']" />
    <div class="flex-1 min-w-0">
      <BlockViewRenderer
        v-if="calloutChildren && calloutChildren.length"
        :blocks="calloutChildren"
      />
    </div>
  </div>
</template>
