<script setup lang="ts">
import { computed, useAttrs } from "vue"
import { scv } from "css-variants"
import { useUi, resolveClasses } from "../../utils"
import type { CheckboxProps } from "../../types/components/checkbox"
import checkboxTheme from "../../themes/checkbox.theme"
import RLVIcon from "./RLVIcon.vue"
const checkbox = scv(checkboxTheme)

const props = withDefaults(defineProps<CheckboxProps & { modelValue?: boolean }>(), {
  size: "md",
  color: "primary"
})

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "change", event: Event): void
}>()

const checked = computed({
  get: () => props.modelValue ?? props.checked ?? false,
  set: (val) => emit("update:modelValue", val)
})

const attrs = useAttrs()

const resolvedClasses = computed(() =>
  resolveClasses(
    checkbox,
    {
      size: props.size,
      color: props.color,
      disabled: props.disabled,
      theme: props.theme
    },
    useUi("checkbox", props.ui),
    props.class
  )
)

function onChange(event: Event) {
  const target = event.target as HTMLInputElement
  checked.value = target.checked
  emit("change", event)
}
</script>

<template>
  <label :class="resolvedClasses.root" data-slot="root">
    <div :class="resolvedClasses.container" data-slot="container">
      <input
        v-bind="attrs"
        type="checkbox"
        :name="name"
        :checked="checked"
        :disabled="disabled"
        :class="resolvedClasses.input"
        data-slot="input"
        @change="onChange"
      />
      <span v-if="checked" :class="resolvedClasses.indicator" data-slot="indicator">
        <RLVIcon name="check" class="h-3 w-3 text-white" />
      </span>
    </div>
    <span v-if="label" :class="resolvedClasses.label" data-slot="label">
      {{ label }}
    </span>
    <slot />
  </label>
</template>
