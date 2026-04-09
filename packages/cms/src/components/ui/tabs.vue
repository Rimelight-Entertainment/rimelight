<script lang="ts">
import { Tabs as TabsPrimitive } from "radix-vue"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { defineComponent, h, type HTMLAttributes, type PropType } from "vue"

export const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

export const TabsList = defineComponent({
  props: {
    class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> },
    variant: {
      type: String as PropType<NonNullable<VariantProps<typeof tabsListVariants>["variant"]>>,
      default: "default"
    }
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        TabsPrimitive.List,
        {
          "data-slot": "tabs-list",
          "data-variant": props.variant,
          "class": cn(tabsListVariants({ variant: props.variant }), props.class),
          ...attrs
        },
        slots
      )
  }
})

export const TabsTrigger = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        TabsPrimitive.Tab,
        {
          "data-slot": "tabs-trigger",
          "class": cn(
            "text-foreground/60 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:text-muted-foreground dark:hover:text-foreground relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
            "data-active:bg-background data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground",
            "after:bg-foreground after:absolute after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
            props.class
          ),
          ...attrs
        },
        slots
      )
  }
})

export const TabsContent = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        TabsPrimitive.Panel,
        {
          "data-slot": "tabs-content",
          "class": cn("flex-1 text-sm outline-none", props.class),
          ...attrs
        },
        slots
      )
  }
})
</script>

<script setup lang="ts">
interface Props {
  class?: any
  orientation?: "horizontal" | "vertical"
}

withDefaults(defineProps<Props>(), {
  orientation: "horizontal"
})
</script>

<template>
  <TabsPrimitive.Root
    data-slot="tabs"
    :data-orientation="orientation"
    :class="cn('group/tabs flex gap-2 data-horizontal:flex-col', $props.class)"
  >
    <slot />
  </TabsPrimitive.Root>
</template>
