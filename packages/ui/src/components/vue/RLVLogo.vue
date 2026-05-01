<script setup lang="ts">
import { computed } from "vue"
import { scv, cx } from "css-variants"
import { twMerge } from "tailwind-merge"
import defu from "defu"
import { logoTheme } from "../../themes/logo.theme.ts"
import { getUIConfig } from "virtual:rimelight-ui"

const logo = scv({
  slots: [...logoTheme.slots],
  base: logoTheme.base,
  variants: logoTheme.variants,
  defaultVariants: logoTheme.defaultVariants,
  classNameResolver: (...args) => twMerge(cx(...args))
})

export interface RLVLogoProps {
  /**
   * The variant of the logo to display.
   *
   * @default "logomark"
   */
  variant?: string
  /**
   * Override the color mode.
   */
  mode?: "color" | "white" | "black"
  /**
   * The URL to link to.
   *
   * @default "/"
   */
  href?: string
  /**
   * UI overrides for individual slots, derived from the logo theme.
   */
  ui?: Partial<Record<keyof typeof logoTheme.base, string>>
  /**
   * External class — applied to the root element.
   */
  class?: string
  /**
   * The alt text for the logo image.
   */
  alt?: string
  /**
   * Standard HTML attributes for <a>
   */
  [key: string]: unknown
}

const props = withDefaults(defineProps<RLVLogoProps>(), {
  variant: "logomark",
  href: "/"
})

defineSlots<{
  /**
   * The default slot for the logo content (e.g., text, custom elements).
   */
  default(props: {}): any
}>()

const globalConfig = getUIConfig()

const mergedUI = computed(() => defu(
  props.ui ?? {},
  (globalConfig.logo as Record<string, unknown>) ?? {}
) as Record<keyof typeof logoTheme.base, string | undefined>)

const resolvedClasses = computed(() => {
  const { root } = logo()
  return {
    root: twMerge(root, mergedUI.value.root, props.class)
  }
})

const logoSrc = computed<string | null>(() => {
  const rcLogos = globalConfig.logos as Record<string, any>
  let src: any = null

  if (rcLogos && typeof rcLogos === "object") {
    src = rcLogos[props.variant]
    if (src && typeof src === "object") {
      src = src[props.mode || "color"] || src.black || src.color
    }
  }

  if (src && typeof src === "string" && src) return src

  return null
})

const isIcon = computed(() => {
  const src = logoSrc.value
  if (!src) return false
  if (src.startsWith("http") || src.startsWith("/") || src.startsWith(".")) return false
  return src.includes(":") || src.startsWith("i-")
})

const Tag = computed(() => props.href ? "a" : "div")
</script>

<template>
  <component
    v-bind="$attrs"
    :is="Tag"
    :href="Tag === 'a' ? href : undefined"
    :aria-label="alt || variant"
    :class="resolvedClasses.root"
    data-slot="rlv-logo"
  >
    <template v-if="logoSrc">
      <!-- Using mode='svg' pattern is not strictly needed for UnoCSS icons -->
      <span v-if="isIcon" :class="[logoSrc, 'size-full block shrink-0']" aria-hidden="true" />
      <img v-else :src="logoSrc" :alt="alt || ''" class="size-full block object-contain shrink-0" />
    </template>
    <slot v-else />
  </component>
</template>
