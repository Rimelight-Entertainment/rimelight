<script setup lang="ts">
import { scv } from "css-variants"
import { useUi, resolveClasses } from "../../utils"
import type { ComponentVariants } from "../../types"
import scrollToTopTheme from "../../themes/scroll-to-top.theme"
import { useScrollToTop } from "../../composables/useScrollToTop"
import { computed } from "vue"

const scrollToTop = scv(scrollToTopTheme)
type ScrollToTopVariants = ComponentVariants<typeof scrollToTopTheme>

export interface RLVScrollToTopProps {
  color?: ScrollToTopVariants["color"]
  progressWidth?: number
  duration?: number
  threshold?: number
  showProgress?: boolean
  ui?: Partial<Record<string, string>>
  class?: string
}

const {
  color = "primary",
  progressWidth = 6,
  duration = 0.1,
  threshold = 200,
  showProgress = false,
  ui: uiProp,
  class: className
} = defineProps<RLVScrollToTopProps>()

const classes = resolveClasses(scrollToTop, { color }, useUi("scroll-to-top", uiProp), className)

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
    :class="['rla-scroll-to-top fixed bottom-6 right-6 z-50', { visible: isVisible }, classes.root]"
    v-bind="$attrs"
  >
    <button type="button" :class="classes.button" aria-label="Scroll to top" @click="scrollToTopFn">
      <div :class="classes.progressBase">
        <svg :class="classes.svg" viewBox="0 0 100 100" shape-rendering="geometricPrecision">
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
        <div :class="classes.iconContainer">
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
            :class="classes.icon"
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
