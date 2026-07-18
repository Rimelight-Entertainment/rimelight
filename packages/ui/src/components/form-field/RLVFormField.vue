<script setup lang="ts">
import { computed, useSlots } from "vue"
import { scv } from "css-variants"
import { useUi } from "../../utils/useUi"
import { resolveClasses } from "../../utils/resolveClasses"
import type { FormFieldProps } from "./form-field"
import formFieldTheme from "./form-field.theme"

const formField = scv(formFieldTheme)

const props = withDefaults(defineProps<FormFieldProps>(), {
  size: "md"
})

const slots = useSlots()

const resolvedClasses = computed(() =>
  resolveClasses(
    formField,
    {
      size: props.size
    },
    useUi("formField", props.ui),
    props.class
  )
)
</script>

<template>
  <div :class="resolvedClasses.root" data-slot="root">
    <div v-if="label || slots.label" class="flex items-center justify-between gap-2">
      <label v-if="label || slots.label" :class="resolvedClasses.label" data-slot="label">
        <slot name="label">{{ label }}</slot>
        <span v-if="required" class="text-error-500">*</span>
      </label>
      <slot name="hint" />
    </div>

    <p
      v-if="description || slots.description"
      :class="resolvedClasses.description"
      data-slot="description"
    >
      <slot name="description">{{ description }}</slot>
    </p>

    <div class="relative">
      <slot :ui="resolvedClasses" />
    </div>

    <p v-if="error || slots.error" :class="resolvedClasses.error" data-slot="error">
      <slot name="error">{{ error }}</slot>
    </p>

    <div v-if="slots.help" class="mt-1">
      <slot name="help" />
    </div>
  </div>
</template>
