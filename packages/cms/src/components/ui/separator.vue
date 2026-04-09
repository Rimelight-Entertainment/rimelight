<script setup lang="ts">
import { Separator as SeparatorPrimitive } from "radix-vue"
import { cn } from "@/lib/utils"

interface Props {
  class?: any
  orientation?: "horizontal" | "vertical"
}

withDefaults(defineProps<Props>(), {
  orientation: "horizontal"
})
</script>

<template>
  <SeparatorPrimitive
    data-slot="separator"
    :orientation="orientation"
    :class="
      cn(
        'bg-border shrink-0 data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch',
        $props.class
      )
    "
  />
</template>
