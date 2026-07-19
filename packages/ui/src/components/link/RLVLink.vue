<script setup lang="ts">
import { computed } from "vue"
import { scv } from "css-variants"
import { useUi } from "../../utils/useUi"
import { resolveClasses } from "../../utils/resolveClasses"
import type { LinkProps } from "./link"
import linkTheme from "./link.theme"
import RLVIcon from "../icon/RLVIcon.vue"
import { resolveLinkAttrs } from "./helpers"

const link = scv(linkTheme)

defineOptions({ name: "RLVLink" })

const props = defineProps<LinkProps>()

defineSlots<{
  default(props: { active: boolean }): any
  leading(props: {}): any
  trailing(props: {}): any
}>()

const attrs = computed(() => resolveLinkAttrs(props))

const resolvedClasses = computed(() => {
  if (props.raw) {
    return { root: props.class || "" } as Record<string, string>
  }

  return resolveClasses(
    link,
    {
      theme: props.theme,
      ...(props.active !== undefined ? { active: props.active } : {}),
      disabled: !!props.disabled
    },
    useUi("link", props.ui),
    props.class
  )
})
</script>

<template>
  <a
    :href="!props.disabled ? props.href : undefined"
    :target="attrs.target"
    :rel="attrs.rel"
    :aria-label="props.ariaLabel"
    :aria-current="attrs.ariaCurrent"
    :aria-disabled="props.disabled ? 'true' : undefined"
    :data-astro-prefetch="attrs.prefetchAttr"
    :class="resolvedClasses.root"
    data-slot="root"
  >
    <slot name="leading">
      <span v-if="props.leadingIcon" :class="resolvedClasses.leadingIcon" data-slot="leading-icon">
        <RLVIcon :name="props.leadingIcon" size="sm" aria-hidden="true" />
      </span>
    </slot>

    <span
      v-if="props.label !== undefined && props.label !== null"
      :class="resolvedClasses.label"
      data-slot="label"
    >
      {{ props.label }}
    </span>
    <slot v-else :active="props.active" />

    <slot name="trailing">
      <span
        v-if="attrs.showTrailingIcon"
        :class="resolvedClasses.trailingIcon"
        data-slot="trailing-icon"
      >
        <RLVIcon :name="attrs.showTrailingIcon" size="sm" aria-hidden="true" />
      </span>
    </slot>

    <span v-if="attrs.isExternal && !props.ariaLabel" class="sr-only" data-slot="external-hint">
      (opens in a new tab)</span
    >
  </a>
</template>
