<script setup lang="ts">
import { computed, useAttrs } from "vue"
import { resolveIcon } from "../../icons"
import type { IconProps } from "./icon"
import { iconTheme } from "./icon.theme"

defineOptions({ name: "RLVIcon", inheritAttrs: false })

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
  <span
    v-if="resolved.isClass"
    v-bind="attrs"
    :class="resolvedClasses.root"
    data-slot="icon"
    aria-hidden="true"
    ><span :class="[resolved.content, 'size-full']"
  /></span>
  <span
    v-else
    v-bind="attrs"
    :class="resolvedClasses.root"
    data-slot="icon"
    aria-hidden="true"
    v-html="resolved.content"
  />
</template>
