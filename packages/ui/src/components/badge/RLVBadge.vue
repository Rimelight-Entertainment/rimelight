<script setup lang="ts">
import { computed, useAttrs } from "vue"
import type { BadgeProps } from "./badge"
import { badgeTheme } from "./badge.theme"

defineOptions({ name: "RLVBadge" })

const attrs = useAttrs()

const props = withDefaults(defineProps<BadgeProps>(), {
  variant: "solid",
  color: "primary",
  size: "md",
  shape: "pill"
})

const resolvedClasses = computed(() =>
  badgeTheme({
    variant: props.variant,
    color: props.color,
    size: props.size,
    shape: props.shape,
    theme: props.theme,
    ui: props.ui,
    class: props.class
  })
)
</script>

<template>
  <span v-bind="attrs" :class="resolvedClasses.root" data-slot="root" :data-theme="theme">
    <slot>{{ label }}</slot>
  </span>
</template>
