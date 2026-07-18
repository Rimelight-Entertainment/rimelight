<script setup lang="ts">
import { computed } from "vue"
import { scv } from "css-variants"
import { useUi, resolveClasses } from "../../utils"
import type { ProgressProps } from "./progress"
import progressTheme from "./progress.theme"

const progress = scv(progressTheme)

const props = withDefaults(defineProps<ProgressProps & { modelValue?: number }>(), {
  modelValue: 0,
  max: 100,
  color: "primary",
  size: "md"
})

const emit = defineEmits<{
  (e: "update:modelValue", value: number): void
}>()

const value = computed({
  get: () => props.value ?? props.modelValue ?? 0,
  set: (val) => emit("update:modelValue", val)
})

const percentage = computed(() => {
  if (props.max <= 0) return 0
  return Math.min(100, Math.max(0, (value.value / props.max) * 100))
})

const resolvedClasses = computed(() =>
  resolveClasses(
    progress,
    {
      color: props.color,
      size: props.size,
      theme: props.theme
    },
    useUi("progress", props.ui),
    props.class
  )
)
</script>

<template>
  <div
    role="progressbar"
    :aria-valuenow="value"
    :aria-valuemin="0"
    :aria-valuemax="max"
    :class="resolvedClasses.root"
    data-slot="root"
  >
    <div
      :class="resolvedClasses.indicator"
      :style="{ width: percentage + '%' }"
      data-slot="indicator"
    />
  </div>
</template>
