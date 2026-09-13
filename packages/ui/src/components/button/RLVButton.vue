<script setup lang="ts">
import { computed, useSlots, useAttrs } from "vue"
import type { ButtonProps } from "./button"
import { buttonTheme } from "./button.theme"
import RLVIcon from "../icon/RLVIcon.vue"
const attrs = useAttrs()

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: "solid",
  color: "primary",
  size: "md",
  justify: "center",
  loading: false,
  square: undefined,
  block: false,
  active: false,
  rounded: false
})

const slots = useSlots()

const isLeading = computed(
  () => !!(props.leadingIcon || props.avatar || slots.leading) || props.loading
)
const isTrailing = computed(
  () => !!(props.trailingIcon || slots.trailing) || (props.loading && !isLeading.value)
)

const showLeadingIcon = computed(() => {
  if (props.loading) return "loaderCircle"
  return props.leadingIcon
})

const showTrailingIcon = computed(() => {
  if (props.loading) return "loaderCircle"
  return props.trailingIcon
})

const leadingIconClass = computed(() => {
  return props.loading && isLeading.value ? "animate-spin" : ""
})

const trailingIconClass = computed(() => {
  return props.loading && isTrailing.value ? "animate-spin" : ""
})

defineSlots<{
  default(props: { ui: Record<string, string> }): any
  leading(props: { ui: Record<string, string> }): any
  trailing(props: { ui: Record<string, string> }): any
}>()

const resolvedClasses = computed(() =>
  buttonTheme({
    variant: props.active && props.activeVariant ? props.activeVariant : props.variant,
    color: props.active && props.activeColor ? props.activeColor : props.color,
    size: props.size,
    justify: props.justify,
    block: props.block,
    square: props.square !== undefined ? props.square : !props.label && !slots.default,
    rounded: props.rounded,
    leading: isLeading.value,
    trailing: isTrailing.value,
    loading: props.loading,
    active: props.active,
    theme: props.theme,
    ui: props.ui,
    class: props.class
  })
)

const Tag = props.href ? "a" : "button"
</script>

<template>
  <component
    v-bind="attrs"
    :is="Tag"
    :href="props.href"
    :type="!props.href ? (props.type as any) || 'button' : undefined"
    :disabled="!props.href ? (props.disabled as any) : undefined"
    :class="resolvedClasses.root"
    data-slot="root"
    :data-theme="props.theme"
  >
    <slot name="leading" :ui="resolvedClasses">
      <span v-if="isLeading" :class="resolvedClasses.leadingIcon" data-slot="leading-icon">
        <RLVIcon :name="showLeadingIcon" :class="leadingIconClass" />
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
        <RLVIcon :name="showTrailingIcon" :class="trailingIconClass" />
      </span>
    </slot>
  </component>
</template>
