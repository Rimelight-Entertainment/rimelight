<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue"

interface Props {
  initial: string
  inputName?: string
}

const props = withDefaults(defineProps<Props>(), {
  inputName: "title"
})

const text = ref(props.initial)

onMounted(() => {
  const input = document.querySelector<HTMLInputElement>(`[name="${props.inputName}"]`)
  if (!input) return
  const handler = () => {
    text.value = input.value || props.initial
  }
  input.addEventListener("input", handler)
  onUnmounted(() => input.removeEventListener("input", handler))
})
</script>

<template>
  {{ text }}
</template>
