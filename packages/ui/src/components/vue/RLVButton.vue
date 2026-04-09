<script setup lang="ts">
import { computed } from "vue"
import { cv, cx } from "css-variants"
import { twMerge } from "tailwind-merge"
import { buttonTheme } from "../../themes/button.theme"

// Create the variant resolver with tailwind-merge for conflict resolution
const button = cv({
  ...buttonTheme,
  classNameResolver: (...args) => twMerge(cx(...args))
})

/**
 * Button props — uses indexed access types on the theme config (same pattern as Nuxt UI's
 * Button['variants']['color'])
 */
export interface RLVButtonProps {
  /**
   * Button variant style.
   *
   * @default "default"
   */
  variant?: keyof typeof buttonTheme.variants.variant
  /**
   * Button size.
   *
   * @default "md"
   */
  size?: keyof typeof buttonTheme.variants.size
  /**
   * Per-instance UI override for the base class string. Merged with variant/size classes via
   * css-variants.
   */
  ui?: { base?: string }
  /**
   * External class — applied after all internal classes.
   */
  class?: string
  /**
   * When provided, renders as <a> instead of <button>.
   */
  href?: string
}

const props = withDefaults(defineProps<RLVButtonProps>(), {
  variant: "default",
  size: "md",
  class: undefined,
  ui: undefined,
  href: undefined
})

// Resolve classes — exactly like Astro: cv() with className param
const resolvedClasses = computed(() => {
  const classes = button({
    variant: props.variant,
    size: props.size,
    className: props.ui?.base
  })
  return classes
})

// Determine whether to render <a> or <button>
const tag = computed(() => (props.href ? "a" : "button"))
</script>

<template>
  <component
    :is="tag"
    :href="href"
    :class="[resolvedClasses, props.class]"
    data-slot="rlv-button"
    v-bind="$attrs"
  >
    <slot />
  </component>
</template>
