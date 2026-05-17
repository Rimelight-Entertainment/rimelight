<script setup lang="ts">
import { computed } from "vue"
import { scv } from "css-variants"
import { useUi, resolveClasses } from "../../utils"
import logoTheme from "../../themes/logo.theme"
import { getUIConfig } from "virtual:rimelight-ui"

const logo = scv(logoTheme)

export interface RLVLogoProps {
  variant?: string
  mode?: "color" | "white" | "black"
  href?: string
  ui?: Partial<Record<string, string>>
  class?: string
  alt?: string
  [key: string]: unknown
}

const props = withDefaults(defineProps<RLVLogoProps>(), {
  variant: "logomark",
  href: "/"
})

defineSlots<{
  default(props: {}): any
}>()

const resolvedClasses = computed(() =>
  resolveClasses(logo, {}, useUi("logo", props.ui), props.class)
)

const logoSrc = computed<string | null>(() => {
  const globalConfig = getUIConfig()
  const rcLogos = globalConfig.logos as Record<string, any>
  let src: any = null

  if (rcLogos && typeof rcLogos === "object") {
    src = rcLogos[props.variant]
    if (src && typeof src === "object") {
      src = src[props.mode || "color"] || src.black || src.color
    }
  }

  if (src && typeof src === "string" && src) return src

  return null
})

const isIcon = computed(() => {
  const src = logoSrc.value
  if (!src) return false
  if (src.startsWith("http") || src.startsWith("/") || src.startsWith(".")) return false
  return src.includes(":") || src.startsWith("i-")
})

const Tag = computed(() => (props.href ? "a" : "div"))
</script>

<template>
  <component
    v-bind="$attrs"
    :is="Tag"
    :href="Tag === 'a' ? href : undefined"
    :aria-label="alt || variant"
    :class="resolvedClasses.root"
    data-slot="rlv-logo"
  >
    <template v-if="logoSrc">
      <span v-if="isIcon" :class="[logoSrc, 'size-full block shrink-0']" aria-hidden="true" />
      <img v-else :src="logoSrc" :alt="alt || ''" class="size-full block object-contain shrink-0" />
    </template>
    <slot v-else />
  </component>
</template>
