<script setup lang="ts">
import { computed } from "vue"
import { scv, cx } from "css-variants"
import { useRC } from "@/composables"
export interface H5Props {
  rc?: {
    root?: string
  }
}
const { rc: rcProp } = defineProps<H5Props>()
const { rc } = useRC("H5", rcProp)
const h5Styles = scv({ slots: ["root"], base: { root: "text-xl font-bold text-highlighted" } })
const styles = computed(() => {
  const resolved = h5Styles()
  return { root: cx(resolved.root, (rc.value as Record<string, string>).root) }
})
</script>

<template>
  <h5 :class="styles.root">
    <slot />
  </h5>
</template>
