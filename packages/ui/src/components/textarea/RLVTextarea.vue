<script setup lang="ts">
import { computed, useAttrs } from "vue"
import { scv } from "css-variants"
import { useUi } from "../../utils/useUi"
import { resolveClasses } from "../../utils/resolveClasses"
import type { TextareaProps } from "./textarea"
import textareaThemeDefault from "./textarea.theme"

defineOptions({ name: "RLVTextarea" })

const attrs = useAttrs()
const textareaScv = scv(textareaThemeDefault)

const modelValue = defineModel<string>()

const props = withDefaults(defineProps<TextareaProps>(), {
  size: "md",
  color: "neutral",
  rows: 3,
  disabled: false,
  readonly: false
})

const resolvedClasses = computed(() =>
  resolveClasses(
    textareaScv,
    {
      size: props.size,
      color: props.color,
      error: !!props.error,
      disabled: props.disabled
    },
    useUi("textarea", props.ui),
    props.class
  )
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
