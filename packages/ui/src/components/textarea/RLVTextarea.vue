<script setup lang="ts">
import { computed, useAttrs } from "vue"
import type { TextareaProps } from "./textarea"
import { textareaTheme } from "./textarea.theme"

defineOptions({ name: "RLVTextarea" })

const attrs = useAttrs()

const modelValue = defineModel<string>()

const props = withDefaults(defineProps<TextareaProps>(), {
  size: "md",
  color: "neutral",
  rows: 3,
  disabled: false,
  readonly: false
})

const resolvedClasses = computed(() =>
  textareaTheme({
    size: props.size,
    color: props.color,
    error: !!props.error,
    disabled: props.disabled,
    class: props.class
  })
)
</script>

<template>
  <textarea
    v-bind="attrs"
    v-model="modelValue"
    :name="name"
    :rows="rows"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :required="required"
    :class="resolvedClasses.root"
    data-slot="root"
  />
</template>
