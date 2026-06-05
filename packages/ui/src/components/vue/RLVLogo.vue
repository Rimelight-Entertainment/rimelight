<script setup lang="ts">
import { computed, useAttrs } from "vue"
import { scv } from "css-variants"
import { useUi, resolveClasses } from "../../utils"
import type { LogoProps } from "../../types/components/logo"
import logoTheme from "../../themes/logo.theme"
import { getUIConfig } from "virtual:rimelight-ui"

const attrs = useAttrs()
const logo = scv(logoTheme)

const {
  variant = "logomark",
  mode,
  href = "/",
  alt,
  ui: uiProp,
  class: className
} = defineProps<LogoProps>()

defineSlots<{
  default(props: {}): any
}>()

const resolvedClasses = computed(() => resolveClasses(logo, {}, useUi("logo", uiProp), className))

const logoFiles = import.meta.glob<{ default: any }>(
  "/src/assets/**/*.{svg,png,jpg,jpeg,webp,gif}",
  { eager: true }
)

function resolveLogo(pathStr: string | null | undefined): any {
  if (!pathStr) return null
  let lookupPath = pathStr
  if (lookupPath.startsWith("./")) {
    lookupPath = lookupPath.substring(1)
  } else if (!lookupPath.startsWith("/")) {
    lookupPath = "/" + lookupPath
  }
  const file = logoFiles[lookupPath]
  if (file) {
    return file.default?.src || file.default
  }
  return pathStr
}

const logoSrc = computed<string | null>(() => {
  const globalConfig = getUIConfig()
  const rcLogos = globalConfig.logos as Record<string, any>
  let src: any = null

  if (rcLogos && typeof rcLogos === "object") {
    src = rcLogos[variant]
    if (src && typeof src === "object") {
      src = src[mode || "color"] || src.black || src.color
    }
  }

  const resolved = resolveLogo(src)
  if (resolved && typeof resolved === "string" && resolved) return resolved

  return null
})

const isIcon = computed(() => {
  const src = logoSrc.value
  if (!src) return false
  if (src.startsWith("http") || src.startsWith("/") || src.startsWith(".")) return false
  return src.includes(":") || src.startsWith("i-")
})

const Tag = computed(() => (href ? "a" : "div"))
</script>

<template>
  <component
    v-bind="attrs"
    :is="Tag"
    :href="Tag === 'a' ? href : undefined"
    :aria-label="alt || variant"
    :class="resolvedClasses.root"
    data-slot="root"
  >
    <template v-if="logoSrc">
      <span v-if="isIcon" :class="[logoSrc, 'size-full block shrink-0']" aria-hidden="true" />
      <img v-else :src="logoSrc" :alt="alt || ''" class="size-full block object-contain shrink-0" />
    </template>
    <slot v-else />
  </component>
</template>
