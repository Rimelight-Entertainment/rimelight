<script setup lang="ts">
import { DialogRoot } from "radix-vue"
import { cn } from "@/lib/utils"

interface DialogProps {
  open?: boolean
  defaultOpen?: boolean
  modal?: boolean
}

interface DialogEmits {
  (e: "update:open", value: boolean): void
}

const props = defineProps<DialogProps>()
const emit = defineEmits<DialogEmits>()
</script>

<template>
  <DialogRoot
    data-slot="dialog"
    :open="props.open"
    :default-open="props.defaultOpen"
    :modal="props.modal"
    @update:open="emit('update:open', $event)"
  >
    <slot />
  </DialogRoot>
</template>

<script lang="ts">
import { defineComponent, h, type HTMLAttributes, type PropType } from "vue"
import {
  DialogRoot,
  DialogTrigger as DialogTriggerPrimitive,
  DialogPortal as DialogPortalPrimitive,
  DialogOverlay as DialogOverlayPrimitive,
  DialogContent as DialogContentPrimitive,
  DialogTitle as DialogTitlePrimitive,
  DialogDescription as DialogDescriptionPrimitive,
  DialogClose as DialogClosePrimitive
} from "radix-vue"
import { cn } from "@/lib/utils"

export const DialogTrigger = defineComponent({
  setup(_, { slots, attrs }) {
    return () => h(DialogTriggerPrimitive, { "data-slot": "dialog-trigger", ...attrs }, slots)
  }
})

export const DialogPortal = defineComponent({
  setup(_, { slots, attrs }) {
    return () => h(DialogPortalPrimitive, { "data-slot": "dialog-portal", ...attrs }, slots)
  }
})

export const DialogOverlay = defineComponent({
  props: {
    class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> }
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        DialogOverlayPrimitive,
        {
          "data-slot": "dialog-overlay",
          "class": cn(
            "fixed inset-0 z-50 bg-black/50 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0",
            props.class
          ),
          ...attrs
        },
        slots
      )
  }
})

export const DialogContent = defineComponent({
  props: {
    class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> }
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        DialogContentPrimitive,
        {
          "data-slot": "dialog-content",
          "class": cn(
            "bg-background fixed top-1/2 left-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border p-6 shadow-lg transition duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
            props.class
          ),
          ...attrs
        },
        slots
      )
  }
})

export const DialogHeader = defineComponent({
  props: {
    class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> }
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "div",
        {
          "data-slot": "dialog-header",
          "class": cn("flex flex-col gap-1", props.class),
          ...attrs
        },
        slots
      )
  }
})

export const DialogFooter = defineComponent({
  props: {
    class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> }
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "div",
        {
          "data-slot": "dialog-footer",
          "class": cn("flex justify-end gap-2", props.class),
          ...attrs
        },
        slots
      )
  }
})

export const DialogTitle = defineComponent({
  props: {
    class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> }
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        DialogTitlePrimitive,
        {
          "data-slot": "dialog-title",
          "class": cn("text-foreground text-base font-semibold", props.class),
          ...attrs
        },
        slots
      )
  }
})

export const DialogDescription = defineComponent({
  props: {
    class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> }
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        DialogDescriptionPrimitive,
        {
          "data-slot": "dialog-description",
          "class": cn("text-muted-foreground text-sm", props.class),
          ...attrs
        },
        slots
      )
  }
})

export const DialogClose = defineComponent({
  setup(_, { slots, attrs }) {
    return () => h(DialogClosePrimitive, { "data-slot": "dialog-close", ...attrs }, slots)
  }
})
</script>
