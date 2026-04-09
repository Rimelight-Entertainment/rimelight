<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"
import { Input } from "@/components/ui/input.vue"
import { cn } from "@/lib/utils"

interface Props {
  name: string
  value?: string
  from?: string
  readOnly?: boolean
  required?: boolean
  placeholder?: string
  class?: any
}

const props = withDefaults(defineProps<Props>(), {
  value: "",
  readOnly: false,
  required: false
})

const value = ref(props.value)
const autoSyncRef = ref(!props.value)
const wrapperRef = ref<HTMLDivElement | null>(null)

function slugify(inputValue: string) {
  return inputValue
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

onMounted(() => {
  if (!props.from || props.readOnly) return

  const form = wrapperRef.value?.closest("form")
  if (!form) return

  const sourceInput = form.querySelector<HTMLInputElement>(`[name="${props.from}"]`)
  if (!sourceInput) return

  const handleInput = () => {
    if (autoSyncRef.value) {
      value.value = slugify(sourceInput.value)
    }
  }

  sourceInput.addEventListener("input", handleInput)
  onUnmounted(() => sourceInput.removeEventListener("input", handleInput))
})
</script>

<template>
  <div ref="wrapperRef">
    <Input
      type="text"
      :id="name"
      :name="name"
      v-model="value"
      @update:model-value="autoSyncRef = false"
      :placeholder="placeholder"
      :read-only="readOnly"
      :required="required"
      :class="cn('shadow-none', $props.class)"
    />
  </div>
</template>
