<script setup lang="ts">
import { computed } from "vue"
import { scv } from "css-variants"
import { useUi, resolveClasses } from "../../utils"
import type { ComponentVariants } from "../../types"
import footerTheme from "../../themes/footer.theme"

const footer = scv(footerTheme)
type FooterVariants = ComponentVariants<typeof footerTheme>

export interface RLVFooterProps {
  contain?: FooterVariants["contain"]
  ui?: Partial<Record<string, string>>
  class?: string
}

const { contain = false, class: className, ui: uiProp } = defineProps<RLVFooterProps>()

defineSlots<{
  left(props: {}): any
  center(props: {}): any
  right(props: {}): any
}>()

const resolvedClasses = computed(() =>
  resolveClasses(footer, { contain }, useUi("footer", uiProp), className)
)
</script>

<template>
  <footer :class="[resolvedClasses.root]" data-slot="rlv-footer" v-bind="$attrs">
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
