<script lang="ts">
import * as PopoverPrimitive from "radix-vue"
import { cn } from "@/lib/utils"
import { defineComponent, h, type HTMLAttributes, type PropType } from "vue"

export const PopoverTrigger = defineComponent({
  setup(_, { slots, attrs }) {
    return () => h(PopoverPrimitive.Trigger, { "data-slot": "popover-trigger", ...attrs }, slots)
  }
})

export const PopoverContent = defineComponent({
  props: {
    class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> },
    align: { type: String as PropType<"start" | "center" | "end">, default: "center" },
    sideOffset: { type: Number, default: 4 }
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(PopoverPrimitive.Portal, null, {
        default: () =>
          h(
            PopoverPrimitive.Content,
            {
              "data-slot": "popover-content",
              "align": props.align,
              "sideOffset": props.sideOffset,
              "class": cn(
                "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
                props.class
              ),
              ...attrs
            },
            slots
          )
      })
  }
})

export const PopoverAnchor = defineComponent({
  setup(_, { slots, attrs }) {
    return () => h(PopoverPrimitive.Anchor, { "data-slot": "popover-anchor", ...attrs }, slots)
  }
})
</script>

<script setup lang="ts">
// Popover is the default export
</script>

<template>
  <PopoverPrimitive.Root data-slot="popover">
    <slot />
  </PopoverPrimitive.Root>
</template>
