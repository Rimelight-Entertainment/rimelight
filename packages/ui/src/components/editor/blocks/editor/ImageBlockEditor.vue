<script setup lang="ts">
import { computed } from "vue"
import type { ImageBlockProps } from "../../types/blocks"
import RLVInput from "../../../input/RLVInput.vue"

const props = defineProps<{ props: ImageBlockProps }>()
const emit = defineEmits<{ "update:props": [value: ImageBlockProps] }>()

const src = computed({
  get: () => props.props.src || "",
  set: (val: string) => emit("update:props", { ...props.props, src: val })
})

const alt = computed({
  get: () => props.props.alt || "",
  set: (val: string) => emit("update:props", { ...props.props, alt: val })
})

const caption = computed({
  get: () => props.props.caption || "",
  set: (val: string) => emit("update:props", { ...props.props, caption: val })
})

defineOptions({ name: "ImageBlockEditor" })
</script>

<template>
  <div
    class="w-full flex flex-col gap-3 p-4 border border-default rounded-xl bg-white dark:bg-neutral-900"
  >
    <div class="flex flex-col gap-1">
      <label class="text-xs font-bold text-dimmed uppercase">Image URL</label>
      <RLVInput v-model="src" placeholder="https://..." class="w-full" />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div class="flex flex-col gap-1">
        <label class="text-xs font-bold text-dimmed uppercase">Alt Text</label>
        <RLVInput v-model="alt" placeholder="Alt description" class="w-full" />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs font-bold text-dimmed uppercase">Caption</label>
        <RLVInput v-model="caption" placeholder="Image caption" class="w-full" />
      </div>
    </div>

    <div
      v-if="src"
      class="mt-2 flex justify-center bg-neutral-100 dark:bg-neutral-800 p-2 rounded-lg"
    >
      <img :src="src" :alt="alt" class="max-h-48 object-cover rounded border border-default" />
    </div>
  </div>
</template>
