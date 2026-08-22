<script setup lang="ts">
import { computed, useAttrs } from "vue"
import { resolveIcon } from "../../icons"
import type { IconProps } from "./icon"
import { iconTheme } from "./icon.theme"

defineOptions({ name: "RLVIcon" })

const attrs = useAttrs()

const props = withDefaults(defineProps<IconProps>(), {
  size: "md"
})

const resolvedClasses = computed(() =>
  iconTheme({
    size: props.size,
    class: props.class
  })
)

const resolved = computed(() => resolveIcon(props.name))
</script>

<template>
  <span v-bind="attrs" :class="resolvedClasses.root" data-slot="icon" aria-hidden="true">
    <span v-if="resolved.isClass" :class="resolved.content" />
    <span v-else v-html="resolved.content" />
  </span>
</template>
