<script setup lang="ts">
import { computed, useSlots } from "vue"
import { scv } from "css-variants"
import { useUi, resolveClasses } from "../../utils"
import type { ComponentVariants } from "../../types"
import buttonTheme from "../../themes/button.theme"

const button = scv(buttonTheme)
type ButtonVariants = ComponentVariants<typeof buttonTheme>

export interface RLVButtonProps {
  variant?: ButtonVariants["variant"]
  color?: ButtonVariants["color"]
  size?: ButtonVariants["size"]
  href?: string
  label?: string
  leadingIcon?: string
  trailingIcon?: string
  loading?: boolean
  square?: boolean
  block?: boolean
  active?: boolean
  activeColor?: ButtonVariants["color"]
  activeVariant?: ButtonVariants["variant"]
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

const resolvedClasses = computed(() =>
  resolveClasses(
    button,
    {
      variant: active && activeVariant ? activeVariant : variant,
      color: active && activeColor ? activeColor : color,
      size,
      block,
      square: square || (!label && !slots.default),
      leading: isLeading.value,
      trailing: isTrailing.value,
      loading,
      active
    },
    useUi("button", uiProp),
    className
  )
)

const Tag = href ? "a" : "button"
</script>

<template>
  <component
    v-bind="$attrs"
    :is="Tag"
    :href="href"
    :class="resolvedClasses.root"
    data-slot="rlv-button"
  >
    <slot name="leading" :ui="resolvedClasses">
      <span v-if="isLeading" :class="resolvedClasses.leadingIcon" data-slot="leading-icon">
        <span :class="[showLeadingIcon, leadingIconClass]" aria-hidden="true" />
      </span>
    </slot>

    <span
      v-if="label !== undefined && label !== null"
      :class="resolvedClasses.label"
      data-slot="label"
    >
      {{ label }}
    </span>
    <slot v-else />

    <slot name="trailing" :ui="resolvedClasses">
      <span v-if="isTrailing" :class="resolvedClasses.trailingIcon" data-slot="trailing-icon">
        <span :class="[showTrailingIcon, trailingIconClass]" aria-hidden="true" />
      </span>
    </slot>
  </component>
</template>
