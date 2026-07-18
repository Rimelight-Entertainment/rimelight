<script setup lang="ts">
import { computed, useSlots, useAttrs } from "vue"
import { scv } from "css-variants"
import { useUi } from "../../utils/useUi"
import { resolveClasses } from "../../utils/resolveClasses"
import type { InputProps } from "./input"
import inputTheme from "./input.theme"

const input = scv(inputTheme)

const props = withDefaults(defineProps<InputProps & { modelValue?: string | number }>(), {
  type: "text",
  size: "md",
  color: "primary"
})

const emit = defineEmits<{
  (e: "update:modelValue", value: string | number): void
  (e: "change", event: Event): void
  (e: "input", event: Event): void
  (e: "focus", event: FocusEvent): void
  (e: "blur", event: FocusEvent): void
}>()

const attrs = useAttrs()
const slots = useSlots()

const value = computed({
  get: () => props.modelValue ?? props.value ?? "",
  set: (val) => emit("update:modelValue", val)
})

const isLeading = computed(() => !!(props.leadingIcon || slots.leading))
const isTrailing = computed(() => !!(props.trailingIcon || slots.trailing))

const resolvedClasses = computed(() =>
  resolveClasses(
    input,
    {
      size: props.size,
      color: props.color,
      error: !!props.error,
      disabled: props.disabled,
      leading: isLeading.value,
      trailing: isTrailing.value,
      theme: props.theme
    },
    useUi("input", props.ui),
    props.class
  )
)

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  value.value = target.value
  emit("input", event)
}

function onChange(event: Event) {
  emit("change", event)
}
</script>

<template>
  <div :class="resolvedClasses.root" data-slot="root">
    <slot name="leading" :ui="resolvedClasses">
      <span v-if="isLeading" :class="resolvedClasses.leadingIcon" data-slot="leading-icon">
        <span :class="leadingIcon" aria-hidden="true" />
      </span>
    </slot>

    <input
      v-bind="attrs"
      :type="type"
      :name="name"
      :value="value"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :class="resolvedClasses.input"
      data-slot="input"
      @input="onInput"
      @change="onChange"
      @focus="(e) => emit('focus', e)"
      @blur="(e) => emit('blur', e)"
    />

    <slot name="trailing" :ui="resolvedClasses">
      <span v-if="isTrailing" :class="resolvedClasses.trailingIcon" data-slot="trailing-icon">
        <span :class="trailingIcon" aria-hidden="true" />
      </span>
    </slot>
  </div>
</template>
