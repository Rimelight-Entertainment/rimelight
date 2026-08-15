<script setup lang="ts">
import { computed } from "vue"
import { scv } from "css-variants"
import { useUi } from "../../utils/resolver"
import { resolveClasses } from "../../utils/resolver"
import type { LinkProps } from "./link"
import { linkTheme } from "./link.theme"
import RLVIcon from "../icon/RLVIcon.vue"
import { resolveLinkAttrs } from "./helpers"

const link = scv(linkTheme)

defineOptions({ name: "RLVLink", inheritAttrs: false })

const props = defineProps<LinkProps>()

defineSlots<{
  default(props: {}): any
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
    v-bind="$attrs"
    :href="attrs.href"
    :target="attrs.target"
    :rel="attrs.rel"
    :aria-label="props.ariaLabel"
    :aria-current="attrs.ariaCurrent"
    :aria-disabled="attrs.ariaDisabled"
    :data-astro-prefetch="attrs.prefetchAttr"
    :class="resolvedClasses.root"
    data-slot="root"
  >
    <slot name="leading">
      <span v-if="props.leadingIcon" :class="resolvedClasses.leadingIcon" data-slot="leading-icon">
        <RLVIcon :name="props.leadingIcon" size="sm" aria-hidden="true" />
      </span>
    </slot>

    <slot v-if="$slots.default" />
    <span
      v-else-if="props.label !== undefined && props.label !== null"
      :class="resolvedClasses.label"
      data-slot="label"
    >
      {{ props.label }}
    </span>

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
      (opens in a new tab)
    </span>
  </a>
</template>
