<script setup lang="ts">
import { computed } from "vue"
import { scv } from "css-variants"

/* region Props */
export interface LinkNodeProps {
  href: string
  target?: string
  content: string
}

const { href, target, content } = defineProps<LinkNodeProps>()
/* endregion */

/* region Styles */
const linkNodeStyles = scv({
  slots: { root: "text-primary hover:underline transition-all" }
})

const styles = linkNodeStyles()
/* endregion */

/* region State */
const rel = computed(() => (target === "_blank" ? "noopener noreferrer" : undefined))
/* endregion */

/* region Meta */
defineOptions({ name: "LinkNode" })
/* endregion */
</script>

<template>
  <a :href="href" :target="target" :rel="rel" :class="styles.root">
    {{ content }}
  </a>
</template>
