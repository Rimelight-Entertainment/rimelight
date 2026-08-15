<script setup lang="ts">
import { computed, useSlots, useAttrs } from "vue"
import type { ModalProps } from "./modal"
import { modalTheme } from "./modal.theme"
import RLVIcon from "../icon/RLVIcon.vue"

defineOptions({ name: "RLVModal" })

const attrs = useAttrs()
const slots = useSlots()

const isOpen = defineModel<boolean>("open", { default: false })

const props = withDefaults(
  defineProps<
    ModalProps & {
      size?: "sm" | "md" | "lg" | "xl"
    }
  >(),
  {
    size: "md",
    closeOnClickOutside: true,
    closeOnEscape: true,
    lockScroll: true,
    unmountOnHide: true
  }
)

const emit = defineEmits<{
  "update:open": [value: boolean]
  "close": []
}>()

const resolvedClasses = computed(() =>
  modalTheme({
    size: props.size,
    ui: props.ui,
    class: props.class
  })
)

function handleClose() {
  isOpen.value = false
  emit("update:open", false)
  emit("close")
}
</script>

<template>
  <div v-if="isOpen || !unmountOnHide" :class="resolvedClasses.root" data-slot="modal-container">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="closeOnClickOutside ? handleClose() : null"
    >
      <div
        v-bind="attrs"
        :class="resolvedClasses.content"
        data-slot="content"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          :class="resolvedClasses.closeButton"
          data-slot="close-button"
          aria-label="Close modal"
          @click="handleClose"
        >
          <RLVIcon name="i-lucide-x" class="size-4" />
        </button>

        <div
          v-if="title || description || slots.title || slots.description"
          :class="resolvedClasses.header"
          data-slot="header"
        >
          <h3 v-if="title" :class="resolvedClasses.title" data-slot="title">
            {{ title }}
          </h3>
          <slot name="title" />

          <p v-if="description" :class="resolvedClasses.description" data-slot="description">
            {{ description }}
          </p>
          <slot name="description" />
        </div>

        <slot />

        <div v-if="slots.footer" :class="resolvedClasses.footer" data-slot="footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
</template>
