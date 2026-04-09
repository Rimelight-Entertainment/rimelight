<script lang="ts">
import { Select as SelectPrimitive } from "radix-vue"
import { cn } from "@/lib/utils"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-vue-next"
import { defineComponent, h, type HTMLAttributes, type PropType } from "vue"

export const SelectGroup = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        SelectPrimitive.Group,
        {
          "data-slot": "select-group",
          "class": cn("scroll-my-1 p-1", props.class),
          ...attrs
        },
        slots
      )
  }
})

export const SelectValue = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        SelectPrimitive.Value,
        {
          "data-slot": "select-value",
          "class": cn("flex flex-1 text-left", props.class),
          ...attrs
        },
        slots
      )
  }
})

export const SelectTrigger = defineComponent({
  props: {
    class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> },
    size: { type: String as PropType<"sm" | "default">, default: "default" }
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        SelectPrimitive.Trigger,
        {
          "data-slot": "select-trigger",
          "data-size": props.size,
          "class": cn(
            "border-input hover:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 bg-muted/30 flex w-fit items-center justify-between gap-1.5 rounded-lg border py-1.5 pr-3 pl-3 text-base whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 data-[size=default]:h-9 data-[size=sm]:h-8 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            props.class
          ),
          ...attrs
        },
        {
          default: () => [
            slots.default?.(),
            h(SelectPrimitive.Icon, {
              render: h(ChevronDownIcon, {
                class: "text-muted-foreground size-4 pointer-events-none"
              })
            })
          ]
        }
      )
  }
})

export const SelectContent = defineComponent({
  props: {
    class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> },
    side: { type: String, default: "bottom" },
    sideOffset: { type: Number, default: 4 },
    align: { type: String, default: "center" },
    alignOffset: { type: Number, default: 0 },
    alignItemWithTrigger: { type: Boolean, default: true }
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(SelectPrimitive.Portal, null, {
        default: () =>
          h(
            SelectPrimitive.Positioner,
            {
              side: props.side,
              sideOffset: props.sideOffset,
              align: props.align,
              alignOffset: props.alignOffset,
              alignItemWithTrigger: props.alignItemWithTrigger,
              class: "z-50 isolate"
            },
            {
              default: () =>
                h(
                  SelectPrimitive.Popup,
                  {
                    "data-slot": "select-content",
                    "data-align-trigger": props.alignItemWithTrigger,
                    "class": cn(
                      "bg-popover text-popover-foreground ring-foreground/10 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg shadow-md ring-1 duration-100 data-[align-trigger=true]:animate-none",
                      props.class
                    ),
                    ...attrs
                  },
                  {
                    default: () => [
                      h(SelectScrollUpButton),
                      h(SelectPrimitive.List, null, slots),
                      h(SelectScrollDownButton)
                    ]
                  }
                )
            }
          )
      })
  }
})

const SelectScrollUpButton = defineComponent({
  props: { class: { type: [String, Object, Array] } },
  setup(props, { attrs }) {
    return () =>
      h(
        SelectPrimitive.ScrollUpArrow,
        {
          "data-slot": "select-scroll-up-button",
          "class": cn(
            "bg-popover top-0 z-10 flex w-full cursor-default items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-4",
            props.class
          ),
          ...attrs
        },
        { default: () => h(ChevronUpIcon) }
      )
  }
})

const SelectScrollDownButton = defineComponent({
  props: { class: { type: [String, Object, Array] } },
  setup(props, { attrs }) {
    return () =>
      h(
        SelectPrimitive.ScrollDownArrow,
        {
          "data-slot": "select-scroll-down-button",
          "class": cn(
            "bg-popover bottom-0 z-10 flex w-full cursor-default items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-4",
            props.class
          ),
          ...attrs
        },
        { default: () => h(ChevronDownIcon) }
      )
  }
})

export const SelectLabel = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        SelectPrimitive.GroupLabel,
        {
          "data-slot": "select-label",
          "class": cn("text-muted-foreground px-1.5 py-1 text-xs", props.class),
          ...attrs
        },
        slots
      )
  }
})

export const SelectItem = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        SelectPrimitive.Item,
        {
          "data-slot": "select-item",
          "class": cn(
            "focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
            props.class
          ),
          ...attrs
        },
        {
          default: () => [
            h(
              SelectPrimitive.ItemText,
              { class: "flex flex-1 shrink-0 gap-2 whitespace-nowrap" },
              slots
            ),
            h(
              SelectPrimitive.ItemIndicator,
              {
                render: h("span", {
                  class:
                    "flex size-4 pointer-events-none items-center right-2 justify-center absolute"
                })
              },
              { default: () => h(CheckIcon, { class: "pointer-events-none" }) }
            )
          ]
        }
      )
  }
})

export const SelectSeparator = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { attrs }) {
    return () =>
      h(SelectPrimitive.Separator, {
        "data-slot": "select-separator",
        "class": cn("bg-border pointer-events-none -mx-1 my-1 h-px", props.class),
        ...attrs
      })
  }
})
</script>

<script setup lang="ts">
import type { PropType } from "vue"

// Select is the default export - aliased to avoid collision with defineProps
const SelectRoot = SelectPrimitive.Root
</script>

<template>
  <SelectRoot>
    <slot />
  </SelectRoot>
</template>
