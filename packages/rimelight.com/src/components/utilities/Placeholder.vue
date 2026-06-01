<script setup lang="ts">
import RLVPlaceholder from "@rimelight/ui/components/vue/RLVPlaceholder.vue";

export interface PlaceholderProps {
  ui?: Record<string, string>;
  class?: string;
}

defineProps<PlaceholderProps>();

defineSlots<{
  default(props: {}): any;
}>();
</script>

<template>
  <RLVPlaceholder :ui="ui" :class="$props.class" v-bind="$attrs">
    <slot />
  </RLVPlaceholder>
</template>
