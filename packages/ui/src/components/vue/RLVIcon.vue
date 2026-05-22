<script setup lang="ts">
import { computed } from "vue"
import { scv } from "css-variants"
import { useUi, resolveClasses } from "../../utils"
import type { IconProps } from "../../types/components/icon"
import iconTheme from "../../themes/icon.theme"

const icon = scv(iconTheme)

const { name, size = "md", ui: uiProp, class: className } = defineProps<IconProps>()

const resolvedClasses = computed(() =>
  resolveClasses(icon, { size }, useUi("icon", uiProp), className)
)

defineSlots<{
  default(props: {}): any
}>()
</script>

<template>
  <span v-bind="$attrs" :class="[resolvedClasses.root, name]" data-slot="root" aria-hidden="true">
    <slot />
  </span>
</template>
