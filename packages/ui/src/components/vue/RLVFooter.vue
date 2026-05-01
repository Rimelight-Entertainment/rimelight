<script setup lang="ts">
import { computed } from "vue"
import { scv, cx } from "css-variants"
import { twMerge } from "tailwind-merge"
import { useUi } from "../../composables"
import { footerTheme } from "../../themes/footer.theme.ts"

const footer = scv({
  slots: [...footerTheme.slots],
  base: footerTheme.base,
  variants: footerTheme.variants,
  defaultVariants: footerTheme.defaultVariants,
  classNameResolver: (...args) => twMerge(cx(...args))
})

export interface RLVFooterProps {
  /**
   * Whether to contain the footer content in a max-width container.
   *
   * @default false
   */
  contain?: boolean
  /**
   * UI overrides for individual slots, derived from the footer theme.
   */
  ui?: Partial<Record<keyof typeof footerTheme.base, string>>
  /**
   * External class — applied to the root element.
   */
  class?: string
}

const {
  contain = false,
  class: className,
  ui: uiProp
} = defineProps<RLVFooterProps>()

defineSlots<{
  /**
   * Content to display on the left side of the footer.
   */
  left(props: {}): any
  /**
   * Content to display in the center of the footer.
   */
  center(props: {}): any
  /**
   * Content to display on the right side of the footer.
   */
  right(props: {}): any
}>()

const mergedUI = useUi("footer", uiProp as Record<string, unknown> | undefined)

const resolvedClasses = computed(() => {
  const classes = footer({
    contain
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
  <footer :class="[resolvedClasses.root, className]" data-slot="rlv-footer" v-bind="$attrs">
    <div :class="resolvedClasses.container">
      <div :class="resolvedClasses.left" data-slot="footer-left">
        <slot name="left" />
      </div>
      <div :class="resolvedClasses.center" data-slot="footer-center">
        <slot name="center" />
      </div>
      <div :class="resolvedClasses.right" data-slot="footer-right">
        <slot name="right" />
      </div>
    </div>
  </footer>
</template>
