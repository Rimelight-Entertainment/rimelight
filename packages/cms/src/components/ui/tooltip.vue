<script lang="ts">
import { Tooltip as TooltipPrimitive } from "radix-vue"
import { cn } from "@/lib/utils"
import { defineComponent, h, type HTMLAttributes, type PropType } from "vue"

export const TooltipProvider = defineComponent({
  props: { delay: { type: Number, default: 0 } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        TooltipPrimitive.Provider,
        { "data-slot": "tooltip-provider", "delay": props.delay, ...attrs },
        slots
      )
  }
})

export const TooltipTrigger = defineComponent({
  setup(_, { slots, attrs }) {
    return () => h(TooltipPrimitive.Trigger, { "data-slot": "tooltip-trigger", ...attrs }, slots)
  }
})

export const TooltipContent = defineComponent({
  props: {
    class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> },
    side: { type: String as PropType<"top" | "bottom" | "left" | "right">, default: "top" },
    sideOffset: { type: Number, default: 4 },
    align: { type: String as PropType<"start" | "center" | "end">, default: "center" },
    alignOffset: { type: Number, default: 0 }
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(TooltipPrimitive.Portal, null, {
        default: () =>
          h(
            TooltipPrimitive.Positioner,
            {
              align: props.align,
              alignOffset: props.alignOffset,
              side: props.side,
              sideOffset: props.sideOffset,
              class: "z-50 isolate"
            },
            {
              default: () =>
                h(
                  TooltipPrimitive.Popup,
                  {
                    "data-slot": "tooltip-content",
                    "class": cn(
                      "bg-foreground text-background data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 z-50 inline-flex w-fit max-w-xs origin-(--transform-origin) items-center gap-1.5 rounded-md px-3 py-1.5 text-xs has-data-[slot=kbd]:pr-1.5 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm",
                      props.class
                    ),
                    ...attrs
                  },
                  {
                    default: () => [
                      slots.default?.(),
                      h(TooltipPrimitive.Arrow, {
                        class:
                          "rounded-[2px] bg-foreground size-2.5 translate-y-[calc(-50%-2px)] rotate-45 z-50 fill-foreground data-[side=bottom]:top-1 data-[side=inline-end]:-translate-y-1/2 data-[side=inline-start]:-translate-y-1/2 data-[side=left]:-translate-y-1/2 data-[side=right]:-translate-y-1/2 data-[side=inline-end]:-left-1 data-[side=inline-end]:top-1/2! data-[side=inline-start]:-right-1 data-[side=inline-start]:top-1/2! data-[side=left]:-right-1 data-[side=left]:top-1/2! data-[side=right]:-left-1 data-[side=right]:top-1/2! data-[side=top]:-bottom-2.5"
                      })
                    ]
                  }
                )
            }
          )
      })
  }
})
</script>

<script setup lang="ts">
// Tooltip is the default export
</script>

<template>
  <TooltipPrimitive.Root data-slot="tooltip">
    <slot />
  </TooltipPrimitive.Root>
</template>
