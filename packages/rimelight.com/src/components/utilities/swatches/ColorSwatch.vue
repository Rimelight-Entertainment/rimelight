<script setup lang="ts">
import { computed } from "vue"
import { addToast } from "@rimelight/ui/utils/toast"
import { scv, cx } from "css-variants"
import { useRC } from "@/composables"
import RLVButton from "@rimelight/ui/components/button/RLVButton.vue"

/* region Props */
export interface ColorSwatchProps {
  name?: string
  hex?: string
  rgb?: string
  hsl?: string
  oklch?: string
  cmyk?: string
  textColor?: string
  rc?: {
    card?: string
    title?: string
    content?: string
    preview?: string
    details?: string
    buttonGroup?: string
    button?: string
  }
  t?: (key: string) => string
}

const {
  name,
  hex,
  rgb,
  hsl,
  oklch,
  cmyk,
  textColor,
  rc: rcProp,
  t = (key: string) => {
    const map: Record<string, string> = {
      "swatch.color_copied": "Color copied!",
      "swatch.color_copy_failed": "Copy failed!",
      "swatch.copy_error_description": "Failed to copy color to clipboard",
      "swatch.copy_hex": "Copy HEX",
      "swatch.copy_rgb": "Copy RGB",
      "swatch.copy_hsl": "Copy HSL",
      "swatch.copy_oklch": "Copy OKLCH",
      "swatch.copy_cmyk": "Copy CMYK"
    }
    return map[key] || key
  }
} = defineProps<ColorSwatchProps>()

const { rc } = useRC("ColorSwatch", rcProp)
/* endregion */

/* region Emits */
export interface ColorSwatchEmits {}
defineEmits<ColorSwatchEmits>()
/* endregion */

/* region Slots */
export interface ColorSwatchSlots {}
defineSlots<ColorSwatchSlots>()
/* endregion */

/* region Styles */
const colorSwatchStyles = scv({
  slots: ["card", "title", "content", "preview", "details", "buttonGroup", "button", "detailsName"],
  base: {
    card: "w-full rounded-none xl:w-fit",
    title: "text-lg font-bold",
    content: "flex flex-col items-center gap-sm xl:flex-row xl:items-start",
    preview: "flex aspect-square size-48 p-sm",
    details: "flex flex-col justify-end gap-xs text-xs",
    buttonGroup: "flex w-full flex-col justify-center gap-sm",
    button: "w-full xl:w-36",
    detailsName: "text-sm font-bold uppercase tracking-wider mb-2 border-b border-current pb-1"
  }
})

const styles = computed(() => {
  const resolved = colorSwatchStyles()
  const result: Record<string, string> = {}
  for (const [slot, value] of Object.entries(resolved)) {
    result[slot] = cx(value, (rc.value as Record<string, string>)[slot])
  }
  return result
})
/* endregion */

/* region State */

const color = computed(() => {
  if (hex) return hex
  if (rgb) return rgb
  if (hsl) return hsl
  if (cmyk) return cmyk
  if (oklch) return oklch
  return "var(--color-primary-500)"
})
/* endregion */

/* region Logic */
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    addToast({
      title: t("swatch.color_copied"),
      description: text,
      color: "primary"
    })
  } catch {
    addToast({
      title: t("swatch.color_copy_failed"),
      description: t("swatch.copy_error_description"),
      color: "danger"
    })
  }
}

function formatColor(colorStr: string) {
  return colorStr.toUpperCase().replace(/\)/g, "").replace(/\(/g, " ").replace(/%/g, "")
}
/* endregion */
</script>

<template>
  <div
    :class="[
      'bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-sm',
      styles.card
    ]"
  >
    <div v-if="name" class="border-b border-neutral-200 dark:border-neutral-800 pb-2 mb-4">
      <h3 :class="styles.title">{{ name }}</h3>
    </div>
    <div :class="styles.content">
      <div :class="styles.preview" :style="{ backgroundColor: color }">
        <div :class="styles.details" :style="{ color: textColor || 'white' }">
          <span v-if="name" :class="styles.detailsName">
            {{ name }}
          </span>
          <span v-if="hex">HEX {{ formatColor(hex) }}</span>
          <span v-if="rgb">{{ formatColor(rgb) }}</span>
          <span v-if="hsl">{{ formatColor(hsl) }}</span>
          <span v-if="oklch">{{ formatColor(oklch) }}</span>
          <span v-if="cmyk">{{ formatColor(cmyk) }}</span>
        </div>
      </div>
      <div :class="styles.buttonGroup">
        <RLVButton
          v-if="hex"
          variant="outline"
          size="sm"
          icon="lucide:copy"
          :label="t('swatch.copy_hex')"
          :class="styles.button"
          @click="copyToClipboard(hex)"
        />
        <RLVButton
          v-if="rgb"
          variant="outline"
          size="sm"
          icon="lucide:copy"
          :label="t('swatch.copy_rgb')"
          :class="styles.button"
          @click="copyToClipboard(rgb)"
        />
        <RLVButton
          v-if="hsl"
          variant="outline"
          size="sm"
          icon="lucide:copy"
          :label="t('swatch.copy_hsl')"
          :class="styles.button"
          @click="copyToClipboard(hsl)"
        />
        <RLVButton
          v-if="oklch"
          variant="outline"
          size="sm"
          icon="lucide:copy"
          :label="t('swatch.copy_oklch')"
          :class="styles.button"
          @click="copyToClipboard(oklch)"
        />
        <RLVButton
          v-if="cmyk"
          variant="outline"
          size="sm"
          icon="lucide:copy"
          :label="t('swatch.copy_cmyk')"
          :class="styles.button"
          @click="copyToClipboard(cmyk)"
        />
      </div>
    </div>
  </div>
</template>
