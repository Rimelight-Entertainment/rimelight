<script lang="ts">
import { cn } from "@/lib/utils"
import { defineComponent, h, type HTMLAttributes } from "vue"

export const TableHeader = defineComponent({
  props: { class: { type: [String, Object, Array] } },
  setup(props, { slots }) {
    return () =>
      h(
        "thead",
        {
          "data-slot": "table-header",
          "class": cn("bg-muted/50 [&_tr]:border-b", props.class)
        },
        slots.default?.()
      )
  }
})

export const TableBody = defineComponent({
  props: { class: { type: [String, Object, Array] } },
  setup(props, { slots }) {
    return () =>
      h(
        "tbody",
        {
          "data-slot": "table-body",
          "class": cn("[&_tr:last-child]:border-0", props.class)
        },
        slots.default?.()
      )
  }
})

export const TableFooter = defineComponent({
  props: { class: { type: [String, Object, Array] } },
  setup(props, { slots }) {
    return () =>
      h(
        "tfoot",
        {
          "data-slot": "table-footer",
          "class": cn("bg-muted/50 border-t font-medium [&>tr]:last:border-b-0", props.class)
        },
        slots.default?.()
      )
  }
})

export const TableRow = defineComponent({
  props: { class: { type: [String, Object, Array] } },
  setup(props, { slots }) {
    return () =>
      h(
        "tr",
        {
          "data-slot": "table-row",
          "class": cn(
            "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
            props.class
          )
        },
        slots.default?.()
      )
  }
})

export const TableHead = defineComponent({
  props: { class: { type: [String, Object, Array] } },
  setup(props, { slots }) {
    return () =>
      h(
        "th",
        {
          "data-slot": "table-head",
          "class": cn(
            "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0",
            props.class
          )
        },
        slots.default?.()
      )
  }
})

export const TableCell = defineComponent({
  props: { class: { type: [String, Object, Array] } },
  setup(props, { slots }) {
    return () =>
      h(
        "td",
        {
          "data-slot": "table-cell",
          "class": cn(
            "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
            props.class
          )
        },
        slots.default?.()
      )
  }
})

export const TableCaption = defineComponent({
  props: { class: { type: [String, Object, Array] } },
  setup(props, { slots }) {
    return () =>
      h(
        "caption",
        {
          "data-slot": "table-caption",
          "class": cn("text-muted-foreground mt-4 text-sm", props.class)
        },
        slots.default?.()
      )
  }
})
</script>

<script setup lang="ts">
import { cn } from "@/lib/utils"

interface Props {
  class?: any
}

defineProps<Props>()
</script>

<template>
  <div data-slot="table-container" class="w-full relative overflow-x-auto">
    <table
      data-slot="table"
      :class="cn('bg-muted/30 w-full caption-bottom rounded-lg text-sm', $props.class)"
    >
      <slot />
    </table>
  </div>
</template>
