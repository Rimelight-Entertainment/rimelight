<script setup lang="ts">
import { computed } from "vue"
import { scv } from "css-variants"
import { useUi, resolveClasses } from "../../utils"
import type { ComponentVariants } from "../../types"
import iconTheme from "../../themes/icon.theme"

const icon = scv(iconTheme)
type IconVariants = ComponentVariants<typeof iconTheme>

export interface RLVIconProps {
  name: string
  size?: IconVariants["size"]
  class?: string
  ui?: Partial<Record<string, string>>
}

const { name, size = "md", class: className, ui: uiProp } = defineProps<RLVIconProps>()

const resolvedClasses = computed(() =>
  resolveClasses(icon, { size }, useUi("icon", uiProp), className)
)

defineSlots<{
  default(props: {}): any
}>()
</script>

<template>
  <span
    v-bind="$attrs"
    :class="[resolvedClasses.root, name]"
    data-slot="rlv-icon"
    aria-hidden="true"
  >
    <slot />
  </span>
</template>
