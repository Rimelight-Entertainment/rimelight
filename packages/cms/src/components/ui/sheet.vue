<script lang="ts">
import { Dialog as SheetPrimitive } from "radix-vue"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button.vue"
import { XIcon } from "lucide-vue-next"
import { defineComponent, h, type HTMLAttributes, type PropType } from "vue"

export const SheetTrigger = defineComponent({
  setup(_, { slots, attrs }) {
    return () => h(SheetPrimitive.Trigger, { "data-slot": "sheet-trigger", ...attrs }, slots)
  }
})

export const SheetClose = defineComponent({
  setup(_, { slots, attrs }) {
    return () => h(SheetPrimitive.Close, { "data-slot": "sheet-close", ...attrs }, slots)
  }
})

export const SheetPortal = defineComponent({
  setup(_, { slots, attrs }) {
    return () => h(SheetPrimitive.Portal, { "data-slot": "sheet-portal", ...attrs }, slots)
  }
})

export const SheetOverlay = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        SheetPrimitive.Backdrop,
        {
          "data-slot": "sheet-overlay",
          "class": cn(
            "fixed inset-0 z-50 bg-black/10 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs",
            props.class
          ),
          ...attrs
        },
        slots
      )
  }
})

export const SheetContent = defineComponent({
  props: {
    class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> },
    side: { type: String as PropType<"top" | "right" | "bottom" | "left">, default: "right" },
    showCloseButton: { type: Boolean, default: true }
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(SheetPrimitive.Portal, null, {
        default: () => [
          h(SheetPrimitive.Backdrop, {
            "data-slot": "sheet-overlay",
            "class": cn(
              "fixed inset-0 z-50 bg-black/10 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs",
              props.class
            )
          }),
          h(
            SheetPrimitive.Popup,
            {
              "data-slot": "sheet-content",
              "data-side": props.side,
              "class": cn(
                "bg-background fixed z-50 flex flex-col gap-4 bg-clip-padding text-sm shadow-lg transition duration-200 ease-in-out data-ending-style:opacity-0 data-starting-style:opacity-0 data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=bottom]:data-ending-style:translate-y-10 data-[side=bottom]:data-starting-style:translate-y-10 data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=left]:data-ending-style:-translate-x-10 data-[side=left]:data-starting-style:-translate-x-10 data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=right]:data-ending-style:translate-x-10 data-[side=right]:data-starting-style:translate-x-10 data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=top]:data-ending-style:-translate-y-10 data-[side=top]:data-starting-style:-translate-y-10 data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm",
                props.class
              ),
              ...attrs
            },
            {
              default: () =>
                [
                  slots.default?.(),
                  props.showCloseButton
                    ? h(
                        SheetPrimitive.Close,
                        {
                          "data-slot": "sheet-close",
                          "render": h(Button, {
                            variant: "ghost",
                            class: "right-3 top-3 absolute",
                            size: "icon-sm"
                          })
                        },
                        {
                          default: () => [h(XIcon), h("span", { class: "sr-only" }, "Close")]
                        }
                      )
                    : null
                ].filter(Boolean)
            }
          )
        ]
      })
  }
})

export const SheetHeader = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "div",
        {
          "data-slot": "sheet-header",
          "class": cn("flex flex-col gap-0.5 p-4", props.class),
          ...attrs
        },
        slots
      )
  }
})

export const SheetFooter = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "div",
        {
          "data-slot": "sheet-footer",
          "class": cn("mt-auto flex flex-col gap-2 p-4", props.class),
          ...attrs
        },
        slots
      )
  }
})

export const SheetTitle = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        SheetPrimitive.Title,
        {
          "data-slot": "sheet-title",
          "class": cn("text-foreground text-base font-medium", props.class),
          ...attrs
        },
        slots
      )
  }
})

export const SheetDescription = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        SheetPrimitive.Description,
        {
          "data-slot": "sheet-description",
          "class": cn("text-muted-foreground text-sm", props.class),
          ...attrs
        },
        slots
      )
  }
})
</script>

<script setup lang="ts">
// Sheet is the default export
</script>

<template>
  <SheetPrimitive.Root data-slot="sheet">
    <slot />
  </SheetPrimitive.Root>
</template>
