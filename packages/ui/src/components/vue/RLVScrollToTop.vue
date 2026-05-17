<script setup lang="ts">
import { scv, cx } from "css-variants"
import { twMerge } from "tailwind-merge"
import defu from "defu"
import scrollToTopTheme from "@/themes/scroll-to-top.theme"
import { useScrollToTop } from "@/composables/useScrollToTop"
import { computed } from "vue"
import { getUIConfig } from "virtual:rimelight-ui"

export interface RLVScrollToTopProps {
  /**
   * Button color.
   *
   * @default "primary"
   */
  color?: keyof typeof scrollToTopTheme.variants.color
  /**
   * Transition duration for the progress circle (in seconds).
   *
   * @default 0.1
   */
  duration?: number
  /**
   * Scroll threshold (in pixels) before the button becomes visible.
   *
   * @default 200
   */
  threshold?: number
  /**
   * Whether to show the scroll progress indicator.
   *
   * @default false
   */
  showProgress?: boolean
  /**
   * Stroke width of the progress circle.
   *
   * @default 6
   */
  progressWidth?: number
  /**
   * UI overrides for individual slots, derived from the scroll-to-top theme.
   */
  ui?: Partial<Record<keyof typeof scrollToTopTheme.base, string>>
  /**
   * External class — applied to the root element.
   */
  class?: string
  /**
   * Standard HTML attributes.
   */
  [key: string]: unknown
}

const scrollToTop = scv({
  slots: [...scrollToTopTheme.slots],
  base: scrollToTopTheme.base,
  variants: scrollToTopTheme.variants,
  compoundVariants: [...scrollToTopTheme.compoundVariants],
  defaultVariants: scrollToTopTheme.defaultVariants,
  classNameResolver: (...args) => twMerge(cx(...args))
})

const {
  color = "primary",
  progressWidth = 6,
  duration = 0.1,
  threshold = 200,
  showProgress = false,
  ui: uiProp,
  class: className
} = defineProps<RLVScrollToTopProps>()

const globalConfig = getUIConfig()

const mergedUI = defu(
  uiProp ?? {},
  (globalConfig["scroll-to-top"] as Record<string, unknown>) ?? {}
) as Record<keyof typeof scrollToTopTheme.base, string | undefined>

const {
  root,
  button,
  progressBase,
  svg: svgClass,
  iconContainer,
  icon
} = scrollToTop({
  color
})

const {
  isVisible,
  scrollPercentage,
  scrollToTop: scrollToTopFn
} = useScrollToTop({
  threshold
})

const circumference = 2 * Math.PI * 45
const percentPx = circumference / 100

const currentPercent = computed(() => scrollPercentage.value)
const percentageInPx = computed(() => `${percentPx}px`)
const durationInSeconds = computed(() => `${duration}s`)
</script>

<template>
  <div
    :class="[
      'rla-scroll-to-top fixed bottom-6 right-6 z-50',
      { visible: isVisible },
      twMerge(root, mergedUI.root, className)
    ]"
    v-bind="$attrs"
  >
    <button
      type="button"
      :class="twMerge(button, mergedUI.button)"
      aria-label="Scroll to top"
      @click="scrollToTopFn"
    >
      <div :class="twMerge(progressBase, mergedUI.progressBase)">
        <svg
          :class="twMerge(svgClass, mergedUI.svg)"
          viewBox="0 0 100 100"
          shape-rendering="geometricPrecision"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="var(--color-primary-950)"
            :stroke-width="progressWidth"
            stroke-dashoffset="0"
            stroke-linecap="round"
            class="gauge-secondary-stroke opacity-100"
          />
          <circle
            v-if="showProgress"
            cx="50"
            cy="50"
            r="45"
            fill="transparent"
            :stroke-width="progressWidth"
            stroke-linecap="round"
            class="gauge-primary-stroke opacity-100"
            :style="{
              '--stroke-percent': currentPercent,
              '--percent-to-px': percentageInPx,
              '--circumference': circumference,
              '--duration': durationInSeconds
            }"
          />
        </svg>
        <div :class="twMerge(iconContainer, mergedUI.iconContainer)">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            :class="twMerge(icon, mergedUI.icon)"
          >
            <path d="m5 12 7-7 7 7" />
            <path d="M12 19V5" />
          </svg>
        </div>
      </div>
    </button>
  </div>
</template>

<style scoped>
.rla-scroll-to-top {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease-in-out;
}

.rla-scroll-to-top.visible {
  opacity: 1;
  pointer-events: auto;
}

.progress-circle-base {
  transform: translateZ(0);
}

.gauge-primary-stroke {
  stroke: var(--color-primary-500);
  --stroke-percent: v-bind(currentPercent);
  --percent-to-px: v-bind(percentageInPx);
  --circumference: v-bind(circumference);
  stroke-dasharray: calc(var(--stroke-percent) * var(--percent-to-px)) var(--circumference);
  transition:
    stroke-dasharray v-bind(durationInSeconds) ease,
    stroke v-bind(durationInSeconds) ease;
  transform: rotate(-90deg);
  transform-origin: center;
  shape-rendering: geometricPrecision;
}

.gauge-secondary-stroke {
  stroke: var(--color-primary-900);
  stroke-dasharray: 282.6;
  transform: rotate(-90deg);
  transform-origin: center;
}
</style>
