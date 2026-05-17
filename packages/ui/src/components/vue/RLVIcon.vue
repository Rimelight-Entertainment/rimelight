<script setup lang="ts">
import { computed } from "vue"
import { scv, cx } from "css-variants"
import { twMerge } from "tailwind-merge"
import { useUi } from "@/composables"
import iconTheme from "@/themes/icon.theme"

const icon = scv({
  slots: [...iconTheme.slots],
  base: iconTheme.base,
  variants: iconTheme.variants,
  defaultVariants: iconTheme.defaultVariants,
  classNameResolver: (...args) => twMerge(cx(...args))
})

export interface RLVIconProps {
  /**
   * Icon name following the UnoCSS icons format. Can be a string like "i-lucide-home" or a Vue
   * component.
   *
   * @example
   *   "i-lucide-home"
   */
  name: string
  /**
   * Size variant for the icon.
   */
  size?: keyof typeof iconTheme.variants.size
  /**
   * External class applied to the root element.
   */
  class?: string
  /**
   * UI overrides for individual slots.
   */
  ui?: Partial<Record<keyof typeof iconTheme.base, string>>
}

const { name, size = "md", class: className, ui: uiProp } = defineProps<RLVIconProps>()

const mergedUI = useUi("icon", uiProp as Record<string, unknown> | undefined)

const resolvedClasses = computed(() => {
  const { root } = icon({ size })
  return {
    root: twMerge(root, mergedUI.value.root, className)
  }
})

defineSlots<{
  default(props: {}): any
}>()
</script>

<template>
  <span
    v-bind="$attrs"
    :class="[resolvedClasses.root, name]"
    data-slot="rlv-icon"
    aria-hidden="true"
  >
    <slot />
  </span>
</template>
