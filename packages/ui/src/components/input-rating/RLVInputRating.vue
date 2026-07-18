<script setup lang="ts">
import { ref, computed, watch, useAttrs } from "vue"
import { scv } from "css-variants"
import { useUi, resolveClasses } from "../../utils"
import type { InputRatingProps } from "./input-rating"
import inputRatingTheme from "./input-rating.theme"
import RLVIcon from "../icon/RLVIcon.vue"

const props = withDefaults(defineProps<InputRatingProps>(), {
  icon: "star",
  color: "primary",
  size: "md",
  orientation: "horizontal",
  step: 1,
  defaultValue: 0,
  length: 5,
  clearable: false,
  hoverable: false,
  disabled: false,
  readonly: false,
  required: false
})

const emit = defineEmits<{
  (e: "update:modelValue", value: number): void
  (e: "change", event: Event): void
}>()

const selectedValue = ref(props.modelValue ?? props.defaultValue ?? 0)
const hoveredValue = ref<number | null>(null)

const displayValue = computed(() => {
  if (props.hoverable && hoveredValue.value !== null) {
    return hoveredValue.value
  }
  return selectedValue.value
})

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== undefined) {
      selectedValue.value = newVal
    }
  }
)

const sizeMap = {
  xs: "0.75rem",
  sm: "1rem",
  md: "1.25rem",
  lg: "1.5rem",
  xl: "1.75rem"
}
const itemSize = computed(() => sizeMap[props.size] || "1.25rem")

const inputRating = scv(inputRatingTheme)
const attrs = useAttrs()

const resolvedClasses = computed(() =>
  resolveClasses(
    inputRating,
    {
      orientation: props.orientation,
      size: props.size,
      color: props.color,
      readonly: props.readonly,
      disabled: props.disabled
    },
    useUi("inputRating", props.ui),
    props.class
  )
)

function fillWidth(itemIndex: number) {
  const val = displayValue.value
  if (val >= itemIndex) return "100%"
  if (val <= itemIndex - 1) return "0%"
  const partial = (val - (itemIndex - 1)) * 100
  return `${partial}%`
}

function onMouseMove(event: MouseEvent, index: number) {
  if (props.disabled || props.readonly) return
  const itemEl = event.currentTarget as HTMLElement
  const rect = itemEl.getBoundingClientRect()
  const x = (event.clientX - rect.left) / rect.width

  const stepVal = props.step || 1
  const steppedX = Math.ceil(x / stepVal) * stepVal
  const val = index - 1 + steppedX

  hoveredValue.value = Math.min(Math.max(val, 0), props.length || 5)
}

function onMouseLeave() {
  hoveredValue.value = null
}

function onClick(event: MouseEvent, index: number) {
  if (props.disabled || props.readonly) return
  const itemEl = event.currentTarget as HTMLElement
  const rect = itemEl.getBoundingClientRect()
  const x = (event.clientX - rect.left) / rect.width

  const stepVal = props.step || 1
  const steppedX = Math.ceil(x / stepVal) * stepVal
  const val = index - 1 + steppedX
  const roundedVal = Math.min(Math.max(val, 0), props.length || 5)

  let finalVal = roundedVal
  if (props.clearable && selectedValue.value === roundedVal) {
    finalVal = 0
  }

  selectedValue.value = finalVal
  emit("update:modelValue", finalVal)
  emit("change", event)
}

function onKeyDown(event: KeyboardEvent) {
  if (props.disabled || props.readonly) return
  const stepVal = props.step || 1
  let newVal = selectedValue.value

  if (event.key === "ArrowRight" || event.key === "ArrowUp") {
    newVal = Math.min(selectedValue.value + stepVal, props.length || 5)
    event.preventDefault()
  } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
    newVal = Math.max(selectedValue.value - stepVal, 0)
    event.preventDefault()
  } else if (event.key === "Home") {
    newVal = 0
    event.preventDefault()
  } else if (event.key === "End") {
    newVal = props.length || 5
    event.preventDefault()
  }

  if (newVal !== selectedValue.value) {
    selectedValue.value = newVal
    emit("update:modelValue", newVal)
    emit("change", event)
  }
}
</script>

<template>
  <div
    v-bind="attrs"
    :class="resolvedClasses.root"
    data-slot="root"
    :id="id"
    role="slider"
    :aria-valuenow="selectedValue"
    aria-valuemin="0"
    :aria-valuemax="length"
    :aria-readonly="readonly"
    :aria-disabled="disabled"
    tabindex="0"
    @keydown="onKeyDown"
  >
    <!-- Hidden input for native form integration -->
    <input
      type="hidden"
      :name="name"
      :value="selectedValue"
      :required="required"
      :disabled="disabled"
    />

    <div
      v-for="i in length"
      :key="i"
      :class="resolvedClasses.item"
      data-slot="item"
      :style="{ '--item-size': itemSize, 'width': itemSize, 'height': itemSize }"
      @mousemove="onMouseMove($event, i)"
      @mouseleave="onMouseLeave"
      @click="onClick($event, i)"
    >
      <!-- Unfilled background layer -->
      <div :class="resolvedClasses.emptyIcon" data-slot="emptyIcon">
        <slot name="item" :index="i" :filled="false">
          <RLVIcon :name="emptyIcon || icon" :size="size" :class="resolvedClasses.icon" />
        </slot>
      </div>

      <!-- Filled active indicator overlay layer -->
      <div
        :class="resolvedClasses.indicator"
        data-slot="indicator"
        :style="{ width: fillWidth(i) }"
        :data-state="displayValue >= i - 0.99 ? 'active' : 'inactive'"
      >
        <slot name="item" :index="i" :filled="true">
          <RLVIcon :name="icon" :size="size" :class="resolvedClasses.icon" />
        </slot>
      </div>
    </div>
  </div>
</template>
