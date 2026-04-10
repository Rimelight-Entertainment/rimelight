<script setup lang="ts">
import { computed } from "vue"
import { scv, cx } from "css-variants"
import { twMerge } from "tailwind-merge"
import { useUi } from "../../composables"
import { headerTheme } from "@/themes/header.theme.ts"

const header = scv({
  slots: [...headerTheme.slots],
  base: headerTheme.base,
  variants: headerTheme.variants,
  defaultVariants: headerTheme.defaultVariants,
  classNameResolver: (...args) => twMerge(cx(...args))
})

export interface RLVHeaderProps {
  /**
   * Whether to contain the header content in a max-width container.
   *
   * @default true
   */
  contain?: boolean
  /**
   * Whether the header should be sticky at the top.
   *
   * @default true
   */
  sticky?: boolean
  /**
   * UI overrides for individual slots, derived from the header theme.
   */
  ui?: Partial<Record<keyof typeof headerTheme.base, string>>
  /**
   * External class — applied to the root element.
   */
  class?: string
}

const {
  contain = true,
  sticky = true,
  class: className,
  ui: uiProp
} = defineProps<RLVHeaderProps>()

const mergedUI = useUi("header", uiProp as Record<string, unknown> | undefined)

const resolvedClasses = computed(() => {
  const classes = header({
    contain,
    sticky
  })

  return {
    root: twMerge(classes.root, mergedUI.value.root as string | undefined),
    container: twMerge(classes.container, mergedUI.value.container as string | undefined),
    left: twMerge(classes.left, mergedUI.value.left as string | undefined),
    center: twMerge(classes.center, mergedUI.value.center as string | undefined),
    right: twMerge(classes.right, mergedUI.value.right as string | undefined)
  }
})
</script>

<template>
  <header :class="[resolvedClasses.root, className]" data-slot="rlv-header" v-bind="$attrs">
    <div :class="resolvedClasses.container">
      <div :class="resolvedClasses.left" data-slot="header-left">
        <slot name="left" />
      </div>
      <div :class="resolvedClasses.center" data-slot="header-center">
        <slot name="center" />
      </div>
      <div :class="resolvedClasses.right" data-slot="header-right">
        <slot name="right" />
      </div>
    </div>
  </header>
</template>
