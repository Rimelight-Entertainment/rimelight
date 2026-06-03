<script setup lang="ts">
import { computed } from "vue";
import { scv, cx } from "css-variants";
import { useRC } from "@/composables";
export interface H1Props {
    rc?: {
        root?: string;
    };
}
const { rc: rcProp } = defineProps<H1Props>();
const { rc } = useRC("H1", rcProp);
const h1Styles = scv({ slots: ["root"], base: { root: "text-5xl font-bold text-highlighted" } });
const styles = computed(() => { const resolved = h1Styles(); return { root: cx(resolved.root, (rc.value as Record<string, string>).root) }; });
</script>

<template>
  <h1 :class="styles.root">
    <slot />
  </h1>
</template>