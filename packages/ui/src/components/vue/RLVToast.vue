<script setup lang="ts">
import { computed } from "vue"
import { scv } from "css-variants"
import { useUi, resolveClasses } from "../../utils"
import type { ToastProps } from "../../types/components/toast"
import toastTheme from "../../themes/toast.theme"
import RLVIcon from "./RLVIcon.vue"

const toast = scv(toastTheme)

const props = withDefaults(defineProps<ToastProps & { id?: string | number }>(), {
  variant: "default",
  duration: 5000
})

const emit = defineEmits<{
  (e: "close", id: string | number | undefined): void
}>()

const resolvedClasses = computed(() =>
  resolveClasses(toast, { variant: props.variant }, useUi("toast", props.ui), props.class)
)

const variantIcons: Record<string, string> = {
  default: "bell",
  error: "circleX",
  success: "circleCheck",
  warning: "alertTriangle",
  info: "info"
}

const icon = computed(() => variantIcons[props.variant] ?? variantIcons.default!)
</script>

<template>
  <div
    :class="resolvedClasses.root"
    data-slot="root"
    role="alert"
    aria-live="assertive"
    aria-atomic="true"
  >
    <RLVIcon :name="icon" class="size-4 shrink-0 mt-0.5" aria-hidden="true" />

    <div class="flex flex-col gap-0.5 flex-1 min-w-0">
      <div v-if="title" :class="resolvedClasses.title" data-slot="title">
        {{ title }}
      </div>
      <div v-if="description" :class="resolvedClasses.description" data-slot="description">
        {{ description }}
      </div>
      <slot />

      <div
        v-if="$slots.actions || actionLabel"
        class="flex items-center justify-end gap-2 mt-3"
        data-slot="actions"
      >
        <slot name="actions">
          <button
            v-if="actionLabel"
            type="button"
            :class="resolvedClasses.action"
            data-slot="action"
          >
            {{ actionLabel }}
          </button>
        </slot>
      </div>
    </div>

    <button
      type="button"
      :class="resolvedClasses.close"
      data-slot="close"
      aria-label="Dismiss notification"
      @click="emit('close', id)"
    >
      <RLVIcon name="close" class="size-3.5" aria-hidden="true" />
    </button>
  </div>
</template>
