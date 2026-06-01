<script setup lang="ts">
import { computed } from "vue";
import { scv, cx } from "css-variants";
import { useRC } from "~/composables";

/* region Props */
export interface TextNodeProps {
  content: string;
  rc?: {
    root?: string;
  };
}

const { content, rc: rcProp } = defineProps<TextNodeProps>();

const { rc } = useRC("TextNode", rcProp);
/* endregion */

/* region Styles */
const textNodeStyles = scv({
  slots: {
    root: "",
  },
});

const styles = computed(() => {
  const resolved = textNodeStyles();
  const result: Record<string, string> = {};
  for (const [slot, value] of Object.entries(resolved)) {
    result[slot] = cx(value, (rc.value as Record<string, string>)[slot]);
  }
  return result as Record<string, string>;
});
/* endregion */

/* region Meta */
defineOptions({
  name: "TextNode",
});
/* endregion */
</script>

<template>
  <span :class="styles.root">{{ content }}</span>
</template>
