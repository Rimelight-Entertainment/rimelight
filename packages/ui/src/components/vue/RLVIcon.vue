<script setup lang="ts">
import { computed } from "vue"
import { scv } from "css-variants"
import { useUi, resolveClasses } from "../../utils"
import type { ComponentVariants, ComponentSlots } from "../../types"
import iconTheme from "../../themes/icon.theme"

const icon = scv(iconTheme)
type IconVariants = ComponentVariants<typeof iconTheme>

export interface RLVIconProps {
  name: string
  size?: IconVariants["size"]
  ui?: ComponentSlots<typeof iconTheme>
  class?: any
}

const { name, size = "md", ui: uiProp, class: className } = defineProps<RLVIconProps>()

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
