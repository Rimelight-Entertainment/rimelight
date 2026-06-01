<script setup lang="ts">
import { computed } from "vue"
import { scv, cx } from "css-variants"
import { useRC } from "~/composables"

export interface H2Props {
  rc?: {
    root?: string
  }
}

const { rc: rcProp } = defineProps<H2Props>()
const { rc } = useRC("H2", rcProp)

const h2Styles = scv({
  slots: ["root"],
  base: {
    root: "text-4xl font-bold text-highlighted"
  }
})

const styles = computed(() => {
  const resolved = h2Styles()
  return {
    root: cx(resolved.root, (rc.value as Record<string, string>).root)
  }
})
</script>

<template>
  <h2 :class="styles.root">
    <slot />
  </h2>
</template>
