<script setup lang="ts">
import { computed, ref } from "vue"
import { scv } from "css-variants"
import { useUi, resolveClasses } from "../../utils"
import type { FormProps } from "../../types/components/form"
import formTheme from "../../themes/form.theme"

const form = scv(formTheme)

const props = defineProps<FormProps>()

const emit = defineEmits<{
  (e: "submit", event: { data: any }): void
  (e: "error", errors: any[]): void
}>()

const resolvedClasses = computed(() =>
  resolveClasses(form, {}, useUi("form", props.ui), props.class)
)

async function onSubmit(event: Event) {
  event.preventDefault()

  if (props.schema && props.state) {
    try {
      const data = await props.schema.parseAsync(props.state)
      emit("submit", { data })
    } catch (err: any) {
      if (err.errors) {
        emit("error", err.errors)
      }
      console.error("Form validation failed", err)
    }
  } else {
    emit("submit", { data: props.state })
  }
}
</script>

<template>
  <form :class="resolvedClasses.root" data-slot="root" @submit="onSubmit">
    <slot :ui="resolvedClasses" />
  </form>
</template>
