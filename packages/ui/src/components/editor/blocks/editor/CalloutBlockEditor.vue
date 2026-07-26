<script setup lang="ts">
import { computed } from "vue"
import type { CalloutBlockProps, CalloutVariant } from "../../types/blocks"

import BlockEditRenderer from "../BlockEditRenderer.vue"

const props = defineProps<{ props: CalloutBlockProps; containerId?: string | null }>()
const emit = defineEmits<{ "update:props": [value: CalloutBlockProps] }>()

const variant = computed({
  get: () => props.props.variant || "info",
  set: (val: CalloutVariant) => emit("update:props", { ...props.props, variant: val })
})

const children = computed({
  get: () => props.props.children || [],
  set: (val: any[]) => emit("update:props", { ...props.props, children: val })
})

const variants: CalloutVariant[] = [
  "info",
  "success",
  "warning",
  "error",
  "commentary",
  "ideation",
  "source"
]

defineOptions({ name: "CalloutBlockEditor" })
</script>

<template>
  <div
    class="w-full flex flex-col gap-3 border border-default rounded-xl p-4 bg-white dark:bg-neutral-900"
  >
    <div class="flex items-center gap-2">
      <label class="text-xs font-bold uppercase tracking-wider text-dimmed">Callout Type:</label>
      <select
        v-model="variant"
        class="bg-neutral-100 dark:bg-neutral-800 border border-default rounded px-2 py-1 text-xs font-medium focus:outline-none"
      >
        <option v-for="v in variants" :key="v" :value="v">
          {{ v.toUpperCase() }}
        </option>
      </select>
    </div>

    <div class="p-3 rounded-lg border border-dashed border-default">
      <BlockEditRenderer v-model:blocks="children" :container-id="containerId" />
    </div>
  </div>
</template>
