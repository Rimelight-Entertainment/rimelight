<script setup lang="ts">
import { computed } from "vue"
import { scv, cx } from "css-variants"
import { useRC } from "~/composables"

/* region Props */
export interface LinkNodeProps {
  href: string
  target?: string
  content: string
  rc?: {
    root?: string
  }
}

const { href, target, content, rc: rcProp } = defineProps<LinkNodeProps>()

const { rc } = useRC("LinkNode", rcProp)
/* endregion */

/* region Styles */
const linkNodeStyles = scv({
  slots: {
    root: "text-primary hover:underline transition-all"
  }
})

const styles = computed(() => {
  const resolved = linkNodeStyles()
  const result: Record<string, string> = {}
  for (const [slot, value] of Object.entries(resolved)) {
    result[slot] = cx(value, (rc.value as Record<string, string>)[slot])
  }
  return result as Record<string, string>
})
/* endregion */

/* region State */
const rel = computed(() => (target === "_blank" ? "noopener noreferrer" : undefined))
/* endregion */

/* region Meta */
defineOptions({
  name: "LinkNode"
})
/* endregion */
</script>

<template>
  <a :href="href" :target="target" :rel="rel" :class="styles.root">
    {{ content }}
  </a>
</template>
