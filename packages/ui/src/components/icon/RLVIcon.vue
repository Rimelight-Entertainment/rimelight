<script setup lang="ts">
import { computed, useAttrs } from "vue"
import { scv } from "css-variants"
import { useUi, resolveClasses, resolveIcon } from "../../utils"
import type { IconProps } from "./icon"
import iconTheme from "./icon.theme"

const icon = scv(iconTheme)

const { name, size = "md", ui: uiProp, class: className } = defineProps<IconProps>()

const attrs = useAttrs()

const resolvedClasses = computed(() =>
  resolveClasses(icon, { size }, useUi("icon", uiProp), className)
)

const resolved = computed(() => resolveIcon(name))

defineSlots<{
  default(props: {}): any
}>()
</script>

<template>
  <span
    v-bind="attrs"
    :class="[resolvedClasses.root, resolved.isClass ? resolved.content : '']"
    data-slot="root"
    aria-hidden="true"
  >
    <span v-if="!resolved.isClass" v-html="resolved.content" class="w-full h-full block" />
    <slot />
  </span>
</template>
