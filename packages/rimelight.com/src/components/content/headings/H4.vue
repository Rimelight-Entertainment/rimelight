<script setup lang="ts">
import { computed } from "vue";
import { scv, cx } from "css-variants";
import { useRC } from "@/composables";
export interface H4Props {
    rc?: {
        root?: string;
    };
}
const { rc: rcProp } = defineProps<H4Props>();
const { rc } = useRC("H4", rcProp);
const h4Styles = scv({ slots: ["root"], base: { root: "text-2xl font-bold text-highlighted" } });
const styles = computed(() => { const resolved = h4Styles(); return { root: cx(resolved.root, (rc.value as Record<string, string>).root) }; });
</script>

<template>
  <h4 :class="styles.root">
    <slot />
  </h4>
</template>