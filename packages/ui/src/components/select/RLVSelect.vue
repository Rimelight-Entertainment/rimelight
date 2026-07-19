<script setup lang="ts">
import { computed, useAttrs } from "vue"
import { scv } from "css-variants"
import { useUi } from "../../utils/useUi"
import { resolveClasses } from "../../utils/resolveClasses"
import type { SelectProps } from "./select"
import selectThemeDefault from "./select.theme"
import RLVIcon from "../icon/RLVIcon.vue"

defineOptions({ name: "RLVSelect" })

const attrs = useAttrs()
const selectScv = scv(selectThemeDefault)

const modelValue = defineModel<string | number | undefined>()

const props = withDefaults(defineProps<SelectProps>(), {
  size: "md",
  color: "neutral",
  disabled: false
})

const resolvedClasses = computed(() =>
  resolveClasses(
    selectScv,
    {
      size: props.size,
      color: props.color,
      disabled: props.disabled
    },
    useUi("select", props.ui),
    props.class
  )
)

const normalizedItems = computed(() => {
  if (!props.items) return []
  return props.items.map((item) => {
    if (typeof item === "string") {
      return { label: item, value: item }
    }
    return item
  })
})
</script>

<template>
  <div :class="resolvedClasses.root" data-slot="root">
    <select
      v-bind="attrs"
      v-model="modelValue"
      :name="name"
      :disabled="disabled"
      :class="resolvedClasses.select"
      data-slot="select"
    >
      <option v-if="placeholder" value="" disabled selected hidden>
        {{ placeholder }}
      </option>
      <option
        v-for="item in normalizedItems"
        :key="String(item.value)"
        :value="item.value"
        :disabled="item.disabled"
      >
        {{ item.label }}
      </option>
    </select>
    <span :class="resolvedClasses.icon" data-slot="icon">
      <RLVIcon name="i-lucide-chevron-down" class="size-4" />
    </span>
  </div>
</template>
