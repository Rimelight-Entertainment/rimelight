<script setup lang="ts">
import { computed, useSlots } from "vue"
import { scv, cx } from "css-variants"
import { twMerge } from "tailwind-merge"
import defu from "defu"
import { buttonTheme } from "../../themes/button.theme.ts"
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
  variant?: keyof typeof buttonTheme.variants.variant
  color?: keyof typeof buttonTheme.variants.color
  size?: keyof typeof buttonTheme.variants.size
  href?: string
  label?: string
  leadingIcon?: string
  trailingIcon?: string
  loading?: boolean
  square?: boolean
  block?: boolean
  active?: boolean
  activeColor?: keyof typeof buttonTheme.variants.color
  activeVariant?: keyof typeof buttonTheme.variants.variant
  ui?: Partial<Record<string, string>>
  class?: string
  [key: string]: unknown
}

const {
  variant = "solid",
  color = "primary",
  size = "md",
  class: className,
  ui: uiProp,
  href,
  label,
  leadingIcon,
  trailingIcon,
  loading = false,
  square = false,
  block = false,
  active = false,
  activeColor,
  activeVariant
} = defineProps<RLVButtonProps>()

const slots = useSlots()

const isLeading = computed(() => !!(leadingIcon || slots.leading) || loading)
const isTrailing = computed(
  () => !!(trailingIcon || slots.trailing) || (loading && !isLeading.value)
)

const showLeadingIcon = computed(() => {
  if (loading) return "i-lucide-loader-circle"
  return leadingIcon
})

const showTrailingIcon = computed(() => {
  if (loading) return "i-lucide-loader-circle"
  return trailingIcon
})

const leadingIconClass = computed(() => {
  return loading && isLeading.value ? "animate-spin" : ""
})

const trailingIconClass = computed(() => {
  return loading && isTrailing.value ? "animate-spin" : ""
})

defineSlots<{
  default(props: {}): any
  leading(props: { ui: Record<string, string> }): any
  trailing(props: { ui: Record<string, string> }): any
}>()

const globalConfig = getUIConfig()

const mergedUI = defu(
  uiProp ?? {},
  (globalConfig.button as Record<string, unknown>) ?? {}
) as Record<string, string | undefined>

const resolved = computed(() =>
  button({
    variant: active && activeVariant ? activeVariant : variant,
    color: active && activeColor ? activeColor : color,
    size,
    block,
    square: square || (!label && !slots.default),
    leading: isLeading.value,
    trailing: isTrailing.value,
    loading,
    active
  })
)

const Tag = href ? "a" : "button"
</script>

<template>
  <component
    v-bind="$attrs"
    :is="Tag"
    :href="href"
    :class="twMerge(resolved.root, mergedUI.root, className)"
    data-slot="rlv-button"
  >
    <slot name="leading" :ui="resolved">
      <span
        v-if="isLeading"
        :class="twMerge(resolved.leadingIcon, mergedUI.leadingIcon)"
        data-slot="leading-icon"
      >
        <span :class="[showLeadingIcon, leadingIconClass]" aria-hidden="true" />
      </span>
    </slot>

    <span
      v-if="label !== undefined && label !== null"
      :class="twMerge(resolved.label, mergedUI.label)"
      data-slot="label"
    >
      {{ label }}
    </span>
    <slot v-else />

    <slot name="trailing" :ui="resolved">
      <span
        v-if="isTrailing"
        :class="twMerge(resolved.trailingIcon, mergedUI.trailingIcon)"
        data-slot="trailing-icon"
      >
        <span :class="[showTrailingIcon, trailingIconClass]" aria-hidden="true" />
      </span>
    </slot>
  </component>
</template>
