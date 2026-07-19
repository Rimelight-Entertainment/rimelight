<script setup lang="ts">
import { computed } from "vue"
import { scv } from "css-variants"
import { useUi } from "../../utils/useUi"
import { resolveClasses } from "../../utils/resolveClasses"
import type { LinkProps } from "./link"
import linkThemeDefault, { createLinkTheme } from "./link.theme"
import { getUIConfig } from "virtual:rimelight-ui"
import RLVIcon from "../icon/RLVIcon.vue"

defineOptions({ name: "RLVLink" })

const uiConfig = getUIConfig()
const linkTheme = uiConfig.colors ? createLinkTheme() : linkThemeDefault
const linkScv = scv(linkTheme)

const props = withDefaults(defineProps<LinkProps>(), {
  ariaCurrentValue: "page"
})

defineSlots<{
  default(props: { active: boolean }): any
  leading(props: {}): any
  trailing(props: {}): any
}>()

const isExternal = computed(
  () => !!(props.external || (props.href && /^(?:https?:)?\/\//.test(props.href)))
)

const linkTarget = computed(() => props.target || (isExternal.value ? "_blank" : undefined))

const linkRel = computed(() => {
  if (props.rel === null || props.rel === "") return undefined
  if (props.rel !== undefined) return props.rel
  if (isExternal.value || (props.target && props.target !== "_self")) return "noopener noreferrer"
  return undefined
})

const isLeading = computed(() => !!props.leadingIcon)

const showTrailingIcon = computed(() => {
  if (isExternal.value && !props.noExternalIcon && !props.trailingIcon) {
    return props.externalIcon || "externalLink"
  }
  return props.trailingIcon
})

const resolvedClasses = computed(() => {
  if (props.raw) {
    return {
      root: props.class || "",
      label: "",
      leadingIcon: "",
      trailingIcon: ""
    }
  }

  return resolveClasses(
    linkScv,
    {
      theme: props.theme,
      ...(props.active !== undefined ? { active: props.active } : {}),
      disabled: !!props.disabled
    },
    useUi("link", props.ui),
    props.class
  )
})

// ---- Handlers ----
function onClick(e: MouseEvent) {
  if (props.disabled) {
    e.stopPropagation()
    e.preventDefault()
    return
  }
}

// ---- Prefetch attribute ----
const prefetchAttr = computed(() => {
  if (!props.prefetch) return undefined
  if (typeof props.prefetch === "string") return props.prefetch
  return "viewport"
})
</script>

<template>
  <!-- Render anchor element -->
  <a
    :href="!disabled ? props.href : undefined"
    :target="linkTarget"
    :rel="linkRel"
    :aria-label="props.ariaLabel"
    :aria-current="props.active ? ariaCurrentValue : undefined"
    :aria-disabled="disabled ? 'true' : undefined"
    :data-astro-prefetch="prefetchAttr"
    :class="resolvedClasses.root"
    data-slot="root"
    @click="onClick"
  >
    <slot name="leading">
      <span v-if="isLeading" :class="resolvedClasses.leadingIcon" data-slot="leading-icon">
        <RLVIcon
          :name="props.leadingIcon"
          size="sm"
          class="!-translate-y-[1.5px]"
          aria-hidden="true"
        />
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
      <span v-if="showTrailingIcon" :class="resolvedClasses.trailingIcon" data-slot="trailing-icon">
        <RLVIcon
          :name="showTrailingIcon"
          size="sm"
          class="!-translate-y-[1.5px]"
          aria-hidden="true"
        />
      </span>
    </slot>

    <span v-if="isExternal && !props.ariaLabel" class="sr-only" data-slot="external-hint">
      (opens in a new tab)</span
    >
  </a>
</template>
