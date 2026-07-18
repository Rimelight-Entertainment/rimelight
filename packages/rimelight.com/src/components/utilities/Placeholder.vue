<script setup lang="ts">
import { useAttrs } from "vue"
import RLVPlaceholder from "@rimelight/ui/components/placeholder/RLVPlaceholder.vue"

const attrs = useAttrs()

export interface PlaceholderProps {
  ui?: Record<string, string>
  class?: string
}

defineProps<PlaceholderProps>()

defineSlots<{
  default(props: {}): any
}>()
</script>

<template>
  <RLVPlaceholder :ui="ui" :class="attrs.class" v-bind="attrs">
    <slot />
  </RLVPlaceholder>
</template>
