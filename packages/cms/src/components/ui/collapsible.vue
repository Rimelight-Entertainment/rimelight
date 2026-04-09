<script lang="ts">
import { Collapsible as CollapsiblePrimitive } from "radix-vue"
import { cn } from "@/lib/utils"
import { defineComponent, h } from "vue"

export const CollapsibleTrigger = defineComponent({
  setup(_, { slots, attrs }) {
    return () =>
      h(CollapsiblePrimitive.Trigger, { "data-slot": "collapsible-trigger", ...attrs }, slots)
  }
})

export const CollapsibleContent = defineComponent({
  props: { class: { type: [String, Object, Array] } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        CollapsiblePrimitive.Panel,
        {
          "data-slot": "collapsible-content",
          "class": cn("overflow-hidden", props.class),
          ...attrs
        },
        slots
      )
  }
})
</script>

<script setup lang="ts">
// Collapsible is the default export - uses the template below
</script>

<template>
  <CollapsiblePrimitive.Root data-slot="collapsible">
    <slot />
  </CollapsiblePrimitive.Root>
</template>
