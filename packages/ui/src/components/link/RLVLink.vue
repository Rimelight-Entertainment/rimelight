<script setup lang="ts">
import { computed, useAttrs } from "vue"
import { scv } from "css-variants"
import { useUi } from "../../utils/useUi"
import { resolveClasses } from "../../utils/resolveClasses"
import type { LinkProps } from "./link"
import linkThemeDefault, { createLinkTheme } from "./link.theme"
import { getUIConfig } from "virtual:rimelight-ui"
import RLVIcon from "../icon/RLVIcon.vue"

defineOptions({ name: "RLVLink" })

const attrs = useAttrs()

const uiConfig = getUIConfig()
const linkTheme = uiConfig.colors ? createLinkTheme() : linkThemeDefault
const linkScv = scv(linkTheme)

const props = defineProps<LinkProps>()

const linkTag = computed(() => props.tag || "a")

const linkHref = computed(() => props.href || (typeof props.to === "string" ? props.to : undefined))

const isExternal = computed(
  () =>
    !!(
      props.external ||
      (linkHref.value &&
        (linkHref.value.startsWith("http://") ||
          linkHref.value.startsWith("https://") ||
          linkHref.value.startsWith("//")))
    )
)

const linkTarget = computed(() => props.target || (isExternal.value ? "_blank" : undefined))
const linkRel = computed(() => props.rel || (isExternal.value ? "noopener noreferrer" : undefined))

const showExternalIcon = computed(() => {
  if (isExternal.value && !props.noExternalIcon && !props.trailingIcon) {
    return props.externalIcon || "externalLink"
  }
  return props.trailingIcon
})

const resolvedClasses = computed(() =>
  resolveClasses(linkScv, { theme: props.theme }, useUi("link", props.ui), props.class)
)
</script>

<template>
  <component
    :is="linkTag"
    v-bind="attrs"
    :href="linkTag === 'a' ? linkHref : undefined"
    :target="linkTag === 'a' ? linkTarget : undefined"
    :rel="linkTag === 'a' ? linkRel : undefined"
    :aria-label="linkTag === 'a' ? props.ariaLabel : undefined"
    :class="resolvedClasses.root"
    data-slot="root"
  >
    <span
      v-if="props.label !== undefined && props.label !== null"
      :class="resolvedClasses.label"
      data-slot="label"
    >
      {{ props.label }}
    </span>
    <slot v-else />
    <RLVIcon
      v-if="showExternalIcon"
      :name="showExternalIcon"
      size="sm"
      class="!-translate-y-[1.5px]"
      aria-hidden="true"
    />
    <span v-if="isExternal && !props.ariaLabel" class="sr-only" data-slot="external-hint">
      (opens in a new tab)</span
    >
  </component>
</template>
