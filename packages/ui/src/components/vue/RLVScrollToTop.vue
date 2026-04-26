<script setup lang="ts">
import { computed } from "vue"
import { scv, cx } from "css-variants"
import { twMerge } from "tailwind-merge"
import defu from "defu"
import { scrollToTopTheme } from "../../themes/scroll-to-top.theme.ts"
import { useScrollToTop } from "../../composables/useScrollToTop"
import { getUIConfig } from "virtual:rimelight-ui"

export interface RLVScrollToTopProps {
  color?: keyof typeof scrollToTopTheme.variants.color
  circleStrokeWidth?: number
  duration?: number
  threshold?: number
  ui?: Partial<Record<keyof typeof scrollToTopTheme.base, string>>
  class?: string
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
  circleStrokeWidth = 4,
  duration = 0.1,
  threshold = 200,
  ui: uiProp,
  class: className,
} = defineProps<RLVScrollToTopProps>()

const globalConfig = getUIConfig()

const mergedUI = defu(
    uiProp ?? {},
    (globalConfig["scroll-to-top"] as Record<string, unknown>) ?? {}
) as Record<keyof typeof scrollToTopTheme.base, string | undefined>

defineSlots<{
  default(props: {}): any
}>()

const { root, button, progressBase, svg: svgClass, iconContainer, icon } = scrollToTop({
  color
})

const { isVisible, scrollPercentage, scrollToTop: scrollToTopFn } = useScrollToTop({
  threshold
})

const circumference = 2 * Math.PI * 45
const percentPx = circumference / 100

const currentPercent = computed(() => scrollPercentage.value)
const percentageInPx = computed(() => `${percentPx}px`)
const durationInSeconds = computed(() => `${duration}s`)
</script>

<template>
  <Transition
    name="fade"
    enter-active-class="transition-opacity duration-300 ease-in"
    leave-active-class="transition-opacity duration-300 ease-out"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div v-if="isVisible" :class="twMerge(root, mergedUI.root, className)">
      <button
        type="button"
        :class="twMerge(button, mergedUI.button)"
        aria-label="Scroll to top"
        @click="scrollToTopFn"
      >
        <div :class="twMerge(progressBase, mergedUI.progressBase)">
          <svg :class="twMerge(svgClass, mergedUI.svg)" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="var(--color-primary-950)"
              :stroke-width="circleStrokeWidth"
              stroke-dashoffset="0"
              stroke-linecap="round"
              class="gauge-secondary-stroke opacity-100"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              :stroke-width="circleStrokeWidth"
              stroke-dashoffset="0"
              stroke-linecap="round"
              class="gauge-primary-stroke opacity-100"
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
  </Transition>
</template>

<style scoped>
.progress-circle-base {
  --circle-size: 100px;
  --circumference: v-bind(circumference);
  --percent-to-px: v-bind(percentageInPx);
  transform: translateZ(0);
}

.gauge-primary-stroke {
  stroke: var(--color-primary-500);
  --stroke-percent: v-bind(currentPercent);
  stroke-dasharray: calc(var(--stroke-percent) * var(--percent-to-px)) var(--circumference);
  transition:
    stroke-dasharray v-bind(durationInSeconds) ease,
    stroke v-bind(durationInSeconds) ease;
  transform: rotate(-90deg);
  transform-origin: center;
}

.gauge-secondary-stroke {
  stroke: var(--color-primary-900);
  stroke-dasharray: var(--circumference);
  transform: rotate(-90deg);
  transform-origin: center;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
