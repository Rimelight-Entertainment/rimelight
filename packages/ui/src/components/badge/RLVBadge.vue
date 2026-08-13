<script setup lang="ts">
import { computed, useAttrs } from "vue"
import { scv } from "css-variants"
import { useUi } from "../../utils/resolver"
import { resolveClasses } from "../../utils/resolver"
import type { BadgeProps } from "./badge"
import badgeThemeDefault from "./badge.theme"

defineOptions({ name: "RLVBadge" })

const attrs = useAttrs()
const badgeScv = scv(badgeThemeDefault)

const props = withDefaults(defineProps<BadgeProps>(), {
  variant: "solid",
  color: "primary",
  size: "md",
  shape: "rounded"
})

const resolvedClasses = computed(() =>
  resolveClasses(
    badgeScv,
    {
      variant: props.variant,
      color: props.color,
      size: props.size,
      shape: props.shape
    },
    useUi("badge", props.ui),
    props.class
  )
)
</script>

<template>
  <span v-bind="attrs" :class="resolvedClasses.root" data-slot="root">
    <slot />
  </span>
</template>
