<script setup lang="ts">
import { computed, useAttrs } from "vue"
import { scv } from "css-variants"
import { useUi } from "../../utils/resolver"
import { resolveClasses } from "../../utils/resolver"
import { resolveIcon } from "./resolver"
import type { IconProps } from "./icon"
import iconThemeDefault from "./icon.theme"

defineOptions({ name: "RLVIcon" })

const attrs = useAttrs()
const iconScv = scv(iconThemeDefault)

const props = withDefaults(defineProps<IconProps>(), {
  size: "md"
})

const resolvedClasses = computed(() =>
  resolveClasses(iconScv, { size: props.size }, useUi("icon", props.ui), props.class)
)

const resolved = computed(() => resolveIcon(props.name))
</script>

<template>
  <span v-bind="attrs" :class="resolvedClasses.root" data-slot="icon" aria-hidden="true">
    <span v-if="resolved.isClass" :class="resolved.content" />
    <span v-else v-html="resolved.content" />
  </span>
</template>
