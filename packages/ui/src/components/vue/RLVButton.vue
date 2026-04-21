<script setup lang="ts">
import { scv, cx } from "css-variants"
import { twMerge } from "tailwind-merge"
import defu from "defu"
import { buttonTheme } from "@/themes/button.theme.ts"
import { getUIConfig } from "virtual:rimelight-ui"

const button = scv({
  slots: [...buttonTheme.slots],
  base: buttonTheme.base,
  variants: buttonTheme.variants,
  compoundVariants: [...buttonTheme.compoundVariants],
  defaultVariants: buttonTheme.defaultVariants,
  classNameResolver: (...args) => twMerge(cx(...args))
})

export interface RLVButtonProps {
  /**
   * Button variant.
   *
   * @default "solid"
   */
  variant?: keyof typeof buttonTheme.variants.variant
  /**
   * Button color.
   *
   * @default "primary"
   */
  color?: keyof typeof buttonTheme.variants.color
  /**
   * Button size.
   *
   * @default "md"
   */
  size?: keyof typeof buttonTheme.variants.size
  /**
   * When provided, renders as <a> instead of <button>.
   */
  href?: string
  /**
   * UI overrides for individual slots, derived from the button theme.
   */
  ui?: Partial<Record<keyof typeof buttonTheme.base, string>>
  /**
   * External class — applied to the root element.
   */
  class?: string
  /**
   * Standard HTML attributes for <button>
   */
  [key: string]: unknown
}

const {
  variant = "solid",
  color = "primary",
  size = "md",
  class: className,
  ui: uiProp,
  href
} = defineProps<RLVButtonProps>()

defineSlots<{
  /**
   * The default slot for the button content (e.g., text, icons).
   */
  default(props: {}): any
}>()


const globalConfig = getUIConfig()

const mergedUI = defu(
  uiProp ?? {},
  (globalConfig.button as Record<string, unknown>) ?? {}
) as Record<keyof typeof buttonTheme.base, string | undefined>

const { root } = button({
  variant,
  color,
  size
})

// Determine whether to render <a> or <button>
const Tag = href ? "a" : "button"
</script>

<template>
  <component
    v-bind="$attrs"
    :is="Tag"
    :href="href"
    :class="twMerge(root, mergedUI.root, className)"
    data-slot="rlv-button"
  >
    <slot />
  </component>
</template>
