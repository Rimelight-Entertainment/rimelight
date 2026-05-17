<script setup lang="ts">
import { scv, cx } from "css-variants"
import { twMerge } from "tailwind-merge"
import defu from "defu"
import placeholderTheme from "@/themes/placeholder.theme"
import { getUIConfig } from "virtual:rimelight-ui"

const placeholder = scv({
  slots: [...placeholderTheme.slots],
  base: placeholderTheme.base,
  variants: placeholderTheme.variants,
  compoundVariants: [...placeholderTheme.compoundVariants],
  defaultVariants: placeholderTheme.defaultVariants,
  classNameResolver: (...args) => twMerge(cx(...args))
})

export interface RLVPlaceholderProps {
  /**
   * UI overrides for individual slots, derived from the placeholder theme.
   */
  ui?: Partial<Record<keyof typeof placeholderTheme.base, string>>
  /**
   * External class — applied to the root element.
   */
  class?: string
  /**
   * Standard HTML attributes.
   */
  [key: string]: unknown
}

const { class: className, ui: uiProp } = defineProps<RLVPlaceholderProps>()

defineSlots<{
  /**
   * The default slot for placeholder content.
   */
  default(props: {}): any
}>()

const globalConfig = getUIConfig()

const mergedUI = defu(
  uiProp ?? {},
  (globalConfig.placeholder as Record<string, unknown>) ?? {}
) as Record<keyof typeof placeholderTheme.base, string | undefined>

const { base, svg } = placeholder()
</script>

<template>
  <div :class="twMerge(base, mergedUI.base, className)" v-bind="$attrs">
    <svg :class="twMerge(svg, mergedUI.svg)">
      <defs>
        <pattern
          id="pattern-5c1e4f0e-62d5-498b-8ff0-cf77bb448c8e"
          x="0"
          y="0"
          width="10"
          height="10"
          patternUnits="userSpaceOnUse"
        >
          <path d="M-3 13 15-5M-5 5l18-18M-1 21 17 3" />
        </pattern>
      </defs>
      <rect
        stroke="none"
        fill="url(#pattern-5c1e4f0e-62d5-498b-8ff0-cf77bb448c8e)"
        width="100%"
        height="100%"
      />
    </svg>

    <slot />
  </div>
</template>
