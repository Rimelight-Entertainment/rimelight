<script setup lang="ts">
import { computed } from "vue"
import { scv, cx } from "css-variants"
import { useRC } from "@/composables"
import { siteConfig } from "@/config/site.config"

/* region Props */
export type CalloutVariant =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "commentary"
  | "ideation"
  | "source"
export interface CalloutProps {
  variant: CalloutVariant
  to?: string
  target?: string
  rc?: {
    icon?: string
    tooltipIcon?: string
  }
  t?: (key: string) => string
}
const {
  variant,
  to,
  target,
  rc: rcProp,
  t = (key: string) => {
    const map: Record<string, string> = {
      "callout.info": "Info",
      "callout.success": "Success",
      "callout.warning": "Warning",
      "callout.error": "Error",
      "callout.commentary": "Commentary",
      "callout.ideation": "Ideation",
      "callout.source": "Source"
    }
    return map[key] || key
  }
} = defineProps<CalloutProps>()
const { rc } = useRC("Callout", rcProp) /* endregion */ /* region Emits */
export interface CalloutEmits {}
defineEmits<CalloutEmits>() /* endregion */ /* region Slots */
export interface CalloutSlots {
  default: (props: {}) => any
  leading: (props: { icon: string; iconClass: string }) => any
}
defineSlots<CalloutSlots>() /* endregion */ /* region Styles */
const calloutStyles = scv({
  slots: ["root", "iconClass", "tooltipIcon", "titleClass", "descriptionClass"],
  base: {
    root: "relative flex gap-4 p-4 rounded-lg border my-4 transition-all text-left",
    iconClass: "size-6 shrink-0",
    tooltipIcon: "pointer-events-auto size-5 opacity-70 hover:opacity-100 transition-opacity",
    titleClass: "font-bold text-sm",
    descriptionClass: "text-sm mt-1"
  },
  variants: {
    variant: {
      info: {
        root: "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200"
      },
      success: {
        root: "bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
      },
      warning: {
        root: "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200"
      },
      error: {
        root: "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
      },
      commentary: {
        root: "bg-neutral-50/50 dark:bg-neutral-900/20 border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200"
      },
      ideation: {
        root: "bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200"
      },
      source: {
        root: "bg-teal-50/50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200"
      }
    }
  }
})
const styles = computed(() => {
  const resolved = calloutStyles({ variant })
  const result: Record<string, string> = {}
  for (const [slot, value] of Object.entries(resolved)) {
    result[slot] = cx(value, (rc.value as Record<string, string>)[slot])
  }
  return result
}) /* endregion */ /* region State */
const config = computed(() => {
  return (
    (siteConfig.ui as any)?.callouts?.[variant] ?? {
      icon: "i-lucide-alert-circle",
      title: variant.toUpperCase(),
      tooltip: ""
    }
  )
})
// Map standard lucide format to UnoCSS syntax
const icon = computed(() => {
  const raw = config.value.icon
  if (raw.startsWith("lucide:")) {
    return `i-lucide-${raw.slice(7)}`
  }
  return raw
})
const title = computed(() => config.value.title)
const tooltip = computed(() => config.value.tooltip)
/* endregion */
/* region Meta */
defineOptions({
  name: "RLCallout"
})
/* endregion */
</script>

<template>
  <component :is="to ? 'a' : 'div'" :href="to" :target="target" :class="styles.root">
    <slot name="leading" :icon="icon" :icon-class="cx(styles.iconClass, rc.icon)">
      <span :class="[icon, styles.iconClass, rc.icon]" aria-hidden="true" />
    </slot>
    <div class="flex-1">
      <h4 :class="styles.titleClass">{{ t(title) }}</h4>
      <div :class="styles.descriptionClass">
        <slot />
      </div>
    </div>
    <div v-if="tooltip" class="self-start">
      <span
        :class="['i-lucide-circle-help', styles.tooltipIcon, rc.tooltipIcon]"
        :title="t(tooltip)"
        aria-hidden="true"
      />
    </div>
  </component>
</template>
