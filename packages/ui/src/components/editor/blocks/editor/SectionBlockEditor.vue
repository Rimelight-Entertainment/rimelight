<script setup lang="ts">
import { computed } from "vue"
import type { SectionBlockProps } from "../../types/blocks"
import RLVInput from "../../../input/RLVInput.vue"
import RLVButton from "../../../button/RLVButton.vue"
import { useI18n } from "../../utils/editorHelpers"

import BlockEditRenderer from "../BlockEditRenderer.vue"

const props = defineProps<{ props: SectionBlockProps; containerId?: string | null }>()
const emit = defineEmits<{ "update:props": [value: SectionBlockProps] }>()

const { t } = useI18n()

const title = computed({
  get: () => props.props.title || "",
  set: (val: string) => emit("update:props", { ...props.props, title: val })
})

const description = computed({
  get: () => props.props.description || "",
  set: (val: string) => emit("update:props", { ...props.props, description: val })
})

const level = computed({
  get: () => props.props.level || 2,
  set: (val: number) => emit("update:props", { ...props.props, level: val as any })
})

const children = computed({
  get: () => props.props.children || [],
  set: (val: any[]) => emit("update:props", { ...props.props, children: val })
})

defineOptions({ name: "SectionBlockEditor" })
</script>

<template>
  <div
    class="w-full flex flex-col gap-4 border border-default rounded-xl p-4 bg-neutral-50/50 dark:bg-neutral-900/30"
  >
    <div class="flex items-center gap-3">
      <select
        v-model.number="level"
        class="bg-white dark:bg-neutral-800 border border-default rounded-lg px-2 py-1 text-xs font-bold focus:outline-none"
      >
        <option :value="1">H1</option>
        <option :value="2">H2</option>
        <option :value="3">H3</option>
        <option :value="4">H4</option>
      </select>
      <RLVInput v-model="title" placeholder="Section Title" class="flex-1 font-bold text-lg" />
    </div>

    <RLVInput
      v-model="description"
      placeholder="Section description (optional)..."
      class="text-sm text-dimmed"
    />

    <div class="pl-4 border-l-2 border-primary-500/30 flex flex-col gap-4 mt-2">
      <BlockEditRenderer v-model:blocks="children" :container-id="containerId" />
    </div>
  </div>
</template>
