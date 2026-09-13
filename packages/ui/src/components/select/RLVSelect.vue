<script setup lang="ts">
import { computed, useAttrs } from "vue"
import type { SelectProps } from "./select"
import { selectTheme } from "./select.theme"
import RLVIcon from "../icon/RLVIcon.vue"

defineOptions({ name: "RLVSelect" })

const attrs = useAttrs()

const modelValue = defineModel<string | number | undefined>()

const props = withDefaults(defineProps<SelectProps>(), {
  size: "md",
  variant: "default",
  color: "neutral",
  disabled: false
})

const resolvedVariant = computed(() =>
  props.variant === "default" || props.variant === "icon" ? props.variant : "default"
)

const resolvedClasses = computed(() =>
  selectTheme({
    size: props.size,
    variant: resolvedVariant.value,
    color: props.color,
    disabled: props.disabled,
    class: props.class
  })
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
    <div v-if="$slots.leading || leadingIcon" :class="resolvedClasses.leading" data-slot="leading">
      <RLVIcon v-if="leadingIcon" :name="leadingIcon" class="size-4" />
      <slot v-else name="leading" />
    </div>
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
        <RLVIcon v-if="item.icon" :name="item.icon" class="rl-select-item-icon" />
        <img
          v-else-if="item.avatar"
          :src="item.avatar.src"
          :alt="item.avatar.alt"
          class="rl-select-item-icon"
        />
        {{ item.label }}
      </option>
    </select>
    <span v-if="resolvedVariant !== 'icon'" :class="resolvedClasses.icon" data-slot="icon">
      <RLVIcon name="i-lucide-chevron-down" class="size-4" />
    </span>
  </div>
</template>

<style>
select.rl-select,
select.rl-select::picker(select) {
  appearance: base-select;
}
select.rl-select::picker-icon {
  display: none;
}
select.rl-select::picker(select) {
  border: 1px solid var(--rl-neutral-200);
  border-radius: var(--radius-md, 0.375rem);
  background-color: var(--rl-neutral-100);
  color: var(--rl-neutral-950);
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.25),
    0 4px 6px -4px rgba(0, 0, 0, 0.15);
  padding: 0.25rem;
  margin-top: 0.25rem;
}
select.rl-select option {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.625rem;
  border-radius: calc(var(--radius-md, 0.375rem) - 0.125rem);
  background-color: var(--rl-neutral-100);
  color: var(--rl-neutral-950);
  font-size: 0.875rem;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}
select.rl-select .rl-select-item-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}
select.rl-select option:hover,
select.rl-select option:focus {
  background-color: var(--rl-neutral-200);
  color: var(--rl-neutral-950);
}
select.rl-select option:checked {
  background-color: var(--rl-primary-500);
  color: var(--primary-foreground, #ffffff);
  font-weight: 500;
}
</style>
