<script setup lang="ts">
import { computed } from "vue"
import { scv } from "css-variants"
import { useUi, resolveClasses } from "../../utils"
import placeholderTheme from "../../themes/placeholder.theme"

const placeholder = scv(placeholderTheme)

export interface RLVPlaceholderProps {
  ui?: Partial<Record<string, string>>
  class?: string
  [key: string]: unknown
}

const { class: className, ui: uiProp } = defineProps<RLVPlaceholderProps>()

defineSlots<{
  /**
   * The default slot for placeholder content.
   */
  default(props: {}): any
}>()

const resolvedClasses = computed(() =>
  resolveClasses(placeholder, {}, useUi("placeholder", uiProp), className)
)
</script>

<template>
  <div :class="resolvedClasses.base" v-bind="$attrs">
    <svg :class="resolvedClasses.svg">
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
