<script lang="ts">
import * as DropdownMenuPrimitive from "radix-vue"
import { cn } from "@/lib/utils"
import { ChevronRightIcon, CheckIcon } from "lucide-vue-next"
import { defineComponent, h, type HTMLAttributes, type PropType } from "vue"

export const DropdownMenuPortal = defineComponent({
  setup(_, { slots, attrs }) {
    return () =>
      h(DropdownMenuPrimitive.Portal, { "data-slot": "dropdown-menu-portal", ...attrs }, slots)
  }
})

export const DropdownMenuTrigger = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        DropdownMenuPrimitive.Trigger,
        {
          "data-slot": "dropdown-menu-trigger",
          "class": cn("outline-none", props.class),
          ...attrs
        },
        slots
      )
  }
})

export const DropdownMenuContent = defineComponent({
  props: {
    class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> },
    align: { type: String as PropType<"start" | "center" | "end">, default: "start" },
    alignOffset: { type: Number, default: 0 },
    side: { type: String as PropType<"top" | "bottom" | "left" | "right">, default: "bottom" },
    sideOffset: { type: Number, default: 4 }
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(DropdownMenuPrimitive.Portal, null, {
        default: () =>
          h(
            DropdownMenuPrimitive.Content,
            {
              "data-slot": "dropdown-menu-content",
              "align": props.align,
              "alignOffset": props.alignOffset,
              "side": props.side,
              "sideOffset": props.sideOffset,
              "class": cn(
                "bg-popover text-popover-foreground ring-foreground/10 z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-32 overflow-x-hidden overflow-y-auto rounded-lg p-1 shadow-md ring-1 outline-none",
                "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
                "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
                "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
                props.class
              ),
              ...attrs
            },
            slots
          )
      })
  }
})

export const DropdownMenuGroup = defineComponent({
  setup(_, { slots, attrs }) {
    return () =>
      h(DropdownMenuPrimitive.Group, { "data-slot": "dropdown-menu-group", ...attrs }, slots)
  }
})

export const DropdownMenuLabel = defineComponent({
  props: {
    class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> },
    inset: { type: Boolean }
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        DropdownMenuPrimitive.Label,
        {
          "data-slot": "dropdown-menu-label",
          "data-inset": props.inset,
          "class": cn(
            "text-muted-foreground px-1.5 py-1 text-xs font-medium data-[inset]:pl-7",
            props.class
          ),
          ...attrs
        },
        slots
      )
  }
})

export const DropdownMenuItem = defineComponent({
  props: {
    class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> },
    inset: { type: Boolean },
    variant: { type: String as PropType<"default" | "destructive">, default: "default" }
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        DropdownMenuPrimitive.Item,
        {
          "data-slot": "dropdown-menu-item",
          "data-inset": props.inset,
          "data-variant": props.variant,
          "class": cn(
            "group/dropdown-menu-item focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-7 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            props.variant === "destructive" &&
              "text-destructive focus:bg-destructive/10 focus:text-destructive dark:focus:bg-destructive/20 *:[svg]:text-destructive",
            props.class
          ),
          ...attrs
        },
        slots
      )
  }
})

export const DropdownMenuSubTrigger = defineComponent({
  props: {
    class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> },
    inset: { type: Boolean }
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        DropdownMenuPrimitive.SubTrigger,
        {
          "data-slot": "dropdown-menu-sub-trigger",
          "data-inset": props.inset,
          "class": cn(
            "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none data-[inset]:pl-7 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            props.class
          ),
          ...attrs
        },
        {
          default: () => [...(slots.default?.() ?? []), h(ChevronRightIcon, { class: "ml-auto" })]
        }
      )
  }
})

export const DropdownMenuSubContent = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      h(DropdownMenuPrimitive.Portal, null, {
        default: () =>
          h(
            DropdownMenuPrimitive.SubContent,
            {
              "data-slot": "dropdown-menu-sub-content",
              "class": cn(
                "bg-popover text-popover-foreground ring-foreground/10 z-50 min-w-24 overflow-hidden rounded-lg p-1 shadow-lg ring-1",
                "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
                "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
                "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
                props.class
              ),
              ...attrs
            },
            slots
          )
      })
  }
})

export const DropdownMenuCheckboxItem = defineComponent({
  props: {
    class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> },
    inset: { type: Boolean },
    checked: { type: Boolean }
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        DropdownMenuPrimitive.CheckboxItem,
        {
          "data-slot": "dropdown-menu-checkbox-item",
          "data-inset": props.inset,
          "class": cn(
            "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-7 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            props.class
          ),
          "checked": props.checked ?? false,
          ...attrs
        },
        {
          default: () => [
            h(
              "span",
              {
                "class": "flex pointer-events-none items-center right-2 justify-center absolute",
                "data-slot": "dropdown-menu-checkbox-item-indicator"
              },
              [h(DropdownMenuPrimitive.ItemIndicator, null, { default: () => h(CheckIcon) })]
            ),
            ...(slots.default?.() ?? [])
          ]
        }
      )
  }
})

export const DropdownMenuRadioGroup = defineComponent({
  setup(_, { slots, attrs }) {
    return () =>
      h(
        DropdownMenuPrimitive.RadioGroup,
        { "data-slot": "dropdown-menu-radio-group", ...attrs },
        slots
      )
  }
})

export const DropdownMenuRadioItem = defineComponent({
  props: {
    class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> },
    inset: { type: Boolean }
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        DropdownMenuPrimitive.RadioItem,
        {
          "data-slot": "dropdown-menu-radio-item",
          "data-inset": props.inset,
          "class": cn(
            "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-7 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            props.class
          ),
          ...attrs
        },
        {
          default: () => [
            h(
              "span",
              {
                "class": "flex pointer-events-none items-center right-2 justify-center absolute",
                "data-slot": "dropdown-menu-radio-item-indicator"
              },
              [h(DropdownMenuPrimitive.ItemIndicator, null, { default: () => h(CheckIcon) })]
            ),
            ...(slots.default?.() ?? [])
          ]
        }
      )
  }
})

export const DropdownMenuSeparator = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { attrs }) {
    return () =>
      h(DropdownMenuPrimitive.Separator, {
        "data-slot": "dropdown-menu-separator",
        "class": cn("bg-border -mx-1 my-1 h-px", props.class),
        ...attrs
      })
  }
})

export const DropdownMenuShortcut = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "span",
        {
          "data-slot": "dropdown-menu-shortcut",
          "class": cn(
            "text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground ml-auto text-xs tracking-widest",
            props.class
          ),
          ...attrs
        },
        slots
      )
  }
})

export const DropdownMenuSub = defineComponent({
  setup(_, { slots, attrs }) {
    return () => h(DropdownMenuPrimitive.Sub, { "data-slot": "dropdown-menu-sub", ...attrs }, slots)
  }
})
</script>

<script setup lang="ts">
// DropdownMenu is the default export
</script>

<template>
  <DropdownMenuPrimitive.Root data-slot="dropdown-menu">
    <slot />
  </DropdownMenuPrimitive.Root>
</template>
