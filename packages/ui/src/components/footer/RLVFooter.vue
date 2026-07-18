<script setup lang="ts">
import { computed, useAttrs } from "vue"
import { scv } from "css-variants"
import { useUi, resolveClasses } from "../../utils"
import type { FooterProps } from "./footer"
import footerTheme from "./footer.theme"

const attrs = useAttrs()
const footer = scv(footerTheme)

const { contain = false, ui: uiProp, class: className } = defineProps<FooterProps>()

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
  <footer :class="[resolvedClasses.root]" data-slot="root" v-bind="attrs">
    <div :class="resolvedClasses.container">
      <div :class="resolvedClasses.left" data-slot="left">
        <slot name="left" />
      </div>
      <div :class="resolvedClasses.center" data-slot="center">
        <slot name="center" />
      </div>
      <div :class="resolvedClasses.right" data-slot="right">
        <slot name="right" />
      </div>
    </div>
  </footer>
</template>
