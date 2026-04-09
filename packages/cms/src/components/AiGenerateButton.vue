<script setup lang="ts">
import { ref } from "vue"
import { Sparkles, Loader2 } from "lucide-vue-next"
import { Button } from "./ui/button.vue"

interface Props {
  endpoint: string
  payload: Record<string, unknown>
  targetField: string
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: "Generate with AI"
})

const loading = ref(false)
const error = ref<string | null>(null)

function setFieldValue(name: string, value: string) {
  const field = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`)
  if (!field) return

  if (field.type === "hidden") {
    field.dispatchEvent(new CustomEvent("cms:set-value", { detail: value }))
    return
  }

  const nativeSetter = (
    Object.getOwnPropertyDescriptor(
      field instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype,
      "value"
    ) as any
  )?.set

  if (nativeSetter) {
    nativeSetter.call(field, value)
  } else {
    field.value = value
  }

  field.dispatchEvent(new Event("input", { bubbles: true }))
  field.dispatchEvent(new Event("change", { bubbles: true }))
}

async function handleGenerate() {
  loading.value = true
  error.value = null
  try {
    const livePayload = { ...props.payload }
    for (const key of Object.keys(livePayload)) {
      const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${key}"]`)
      if (el) livePayload[key] = el.value
    }

    const response = await fetch(props.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(livePayload)
    })

    if (!response.ok) {
      const err = (await response.json().catch(() => ({ error: "Generation failed" }))) as {
        error?: string
      }
      throw new Error(err.error || "Generation failed")
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error("No response stream")

    const decoder = new TextDecoder()
    let accumulated = ""

    while (true) {
      // eslint-disable-next-line no-await-in-loop
      const { done, value } = await reader.read()
      if (done) break
      accumulated += decoder.decode(value, { stream: true })
      setFieldValue(props.targetField, accumulated)
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Generation failed"
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <Button
      type="button"
      variant="outline"
      size="sm"
      @click="handleGenerate"
      :disabled="loading"
      class="text-foreground/70"
    >
      <Loader2 v-if="loading" class="size-3 animate-spin" />
      <Sparkles v-else class="size-4 stroke-1" />
      {{ label }}
    </Button>
    <p v-if="error" class="text-xs text-destructive mt-1">{{ error }}</p>
  </div>
</template>
