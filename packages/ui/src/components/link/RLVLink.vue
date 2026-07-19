<script setup lang="ts">
import { computed } from "vue"
import { scv } from "css-variants"
import { useUi } from "../../utils/useUi"
import { resolveClasses } from "../../utils/resolveClasses"
import type { LinkProps } from "./link"
import linkTheme from "./link.theme"
import RLVIcon from "../icon/RLVIcon.vue"

const link = scv(linkTheme)

defineOptions({ name: "RLVLink" })

const {
  label,
  leadingIcon,
  trailingIcon,
  href,
  external,
  externalIcon,
  noExternalIcon,
  target,
  rel,
  prefetch,
  active,
  disabled,
  raw,
  ariaLabel,
  ariaCurrentValue = "page",
  theme,
  ui: uiProp,
  class: className
} = defineProps<LinkProps>()

defineSlots<{
  default(props: { active: boolean }): any
  leading(props: {}): any
  trailing(props: {}): any
}>()

const isExternal = computed(() => !!(external || (href && /^(?:https?:)?\/\//.test(href))))

const showTrailingIcon = computed(() => {
  if (isExternal.value && !noExternalIcon && !trailingIcon) {
    return externalIcon || "externalLink"
  }
  return trailingIcon
})

const resolvedClasses = computed(() => {
  if (raw) {
    return { root: className || "" } as Record<string, string>
  }

  return resolveClasses(
    link,
    {
      theme,
      ...(active !== undefined ? { active } : {}),
      disabled: !!disabled
    },
    useUi("link", uiProp),
    className
  )
})

function onClick(e: MouseEvent) {
  if (disabled) {
    e.stopPropagation()
    e.preventDefault()
    return
  }
}
</script>

<template>
  <a
    :href="!disabled ? href : undefined"
    :target="target || (isExternal ? '_blank' : undefined)"
    :rel="
      rel === null || rel === ''
        ? undefined
        : (rel ??
          (isExternal || (target && target !== '_self') ? 'noopener noreferrer' : undefined))
    "
    :aria-label="ariaLabel"
    :aria-current="active ? ariaCurrentValue : undefined"
    :aria-disabled="disabled ? 'true' : undefined"
    :data-astro-prefetch="
      prefetch ? (typeof prefetch === 'string' ? prefetch : 'viewport') : undefined
    "
    :class="resolvedClasses.root"
    data-slot="root"
    @click="onClick"
  >
    <slot name="leading">
      <span v-if="leadingIcon" :class="resolvedClasses.leadingIcon" data-slot="leading-icon">
        <RLVIcon :name="leadingIcon" size="sm" class="!-translate-y-[1.5px]" aria-hidden="true" />
      </span>
    </slot>

    <span
      v-if="label !== undefined && label !== null"
      :class="resolvedClasses.label"
      data-slot="label"
    >
      {{ label }}
    </span>
    <slot v-else :active="active" />

    <slot name="trailing">
      <span v-if="showTrailingIcon" :class="resolvedClasses.trailingIcon" data-slot="trailing-icon">
        <RLVIcon
          :name="showTrailingIcon"
          size="sm"
          class="!-translate-y-[1.5px]"
          aria-hidden="true"
        />
      </span>
    </slot>

    <span v-if="isExternal && !ariaLabel" class="sr-only" data-slot="external-hint">
      (opens in a new tab)</span
    >
  </a>
</template>
