<script lang="ts">
import { AlertDialog as AlertDialogPrimitive } from "radix-vue"
import { cn } from "@/lib/utils"
import { defineComponent, h, type HTMLAttributes, type PropType } from "vue"

export const AlertDialogTrigger = defineComponent({
  setup(_, { slots, attrs }) {
    return () =>
      h(AlertDialogPrimitive.Trigger, { "data-slot": "alert-dialog-trigger", ...attrs }, slots)
  }
})

export const AlertDialogPortal = defineComponent({
  setup(_, { slots, attrs }) {
    return () =>
      h(AlertDialogPrimitive.Portal, { "data-slot": "alert-dialog-portal", ...attrs }, slots)
  }
})

export const AlertDialogOverlay = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        AlertDialogPrimitive.Backdrop,
        {
          "data-slot": "alert-dialog-overlay",
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

export const AlertDialogContent = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      h(AlertDialogPrimitive.Portal, null, {
        default: () => [
          h(AlertDialogPrimitive.Backdrop, {
            "data-slot": "alert-dialog-overlay",
            "class": cn(
              "fixed inset-0 z-50 bg-black/50 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0",
              props.class
            )
          }),
          h(
            AlertDialogPrimitive.Popup,
            {
              "data-slot": "alert-dialog-content",
              "class": cn(
                "bg-background fixed top-1/2 left-1/2 z-50 grid w-full max-w-104 -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border p-6 shadow-lg transition duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
                props.class
              ),
              ...attrs
            },
            slots
          )
        ]
      })
  }
})

export const AlertDialogHeader = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "div",
        {
          "data-slot": "alert-dialog-header",
          "class": cn("flex flex-col gap-1", props.class),
          ...attrs
        },
        slots
      )
  }
})

export const AlertDialogFooter = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "div",
        {
          "data-slot": "alert-dialog-footer",
          "class": cn("flex justify-end gap-2", props.class),
          ...attrs
        },
        slots
      )
  }
})

export const AlertDialogTitle = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        AlertDialogPrimitive.Title,
        {
          "data-slot": "alert-dialog-title",
          "class": cn("text-foreground text-base font-semibold", props.class),
          ...attrs
        },
        slots
      )
  }
})

export const AlertDialogDescription = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        AlertDialogPrimitive.Description,
        {
          "data-slot": "alert-dialog-description",
          "class": cn("text-muted-foreground text-sm", props.class),
          ...attrs
        },
        slots
      )
  }
})

export const AlertDialogClose = defineComponent({
  setup(_, { slots, attrs }) {
    return () =>
      h(AlertDialogPrimitive.Close, { "data-slot": "alert-dialog-close", ...attrs }, slots)
  }
})
</script>

<script setup lang="ts">
// AlertDialog is the default export
</script>

<template>
  <AlertDialogPrimitive.Root data-slot="alert-dialog">
    <slot />
  </AlertDialogPrimitive.Root>
</template>
