<script setup lang="ts">
import { computed } from "vue";
import { scv, cx } from "css-variants";
import { useRC } from "~/composables";

export interface H3Props {
  rc?: {
    root?: string;
  };
}

const { rc: rcProp } = defineProps<H3Props>();
const { rc } = useRC("H3", rcProp);

const h3Styles = scv({
  slots: ["root"],
  base: {
    root: "text-3xl font-bold text-highlighted",
  },
});

const styles = computed(() => {
  const resolved = h3Styles();
  return {
    root: cx(resolved.root, (rc.value as Record<string, string>).root),
  };
});
</script>

<template>
  <h3 :class="styles.root">
    <slot />
  </h3>
</template>
