<script setup lang="ts">
import { computed } from "vue"
import { scv, cx } from "css-variants"
import { useRC } from "~/composables"

export interface H6Props {
  rc?: {
    root?: string
  }
}

const { rc: rcProp } = defineProps<H6Props>()
const { rc } = useRC("H6", rcProp)

const h6Styles = scv({
  slots: ["root"],
  base: {
    root: "text-lg font-bold text-highlighted"
  }
})

const styles = computed(() => {
  const resolved = h6Styles()
  return {
    root: cx(resolved.root, (rc.value as Record<string, string>).root)
  }
})
</script>

<template>
  <h6 :class="styles.root">
    <slot />
  </h6>
</template>
