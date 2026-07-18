<script setup lang="ts">
import { scv } from "css-variants"
import { useUi, resolveClasses } from "../../utils"
import type { ScrollToTopProps } from "./scroll-to-top"
import scrollToTopTheme from "./scroll-to-top.theme"
import { trackScroll, scrollToTop as scrollToTopFn } from "../../utils"
import { ref, computed, onMounted, onUnmounted, watch, useAttrs } from "vue"

const attrs = useAttrs()
const scrollToTop = scv(scrollToTopTheme)

const {
  color = "primary",
  progressWidth = 6,
  duration = 0.1,
  threshold = 200,
  showProgress = false,
  ui: uiProp,
  class: className
} = defineProps<ScrollToTopProps>()

const classes = resolveClasses(scrollToTop, { color }, useUi("scrollToTop", uiProp), className)

const isVisible = ref(false)
const scrollPercentage = ref(0)

const instanceId = `rla-vue-${Math.random().toString(36).slice(2, 8)}`
const gaugeBorderWidth = progressWidth * 0.5

let styleEl: HTMLStyleElement | null = null

function updateCssVars() {
  if (!styleEl) return
  styleEl.textContent = `
    [data-rla-instance="${instanceId}"] {
      --gauge-track-border-color: var(--color-${color}-900);
      --gauge-track-bg: var(--color-${color}-950);
      --gauge-stroke-width: ${gaugeBorderWidth}px;
      --gauge-color: var(--color-${color}-500);
      --gauge-progress: ${scrollPercentage.value};
    }
  `
}

watch(scrollPercentage, updateCssVars)

let unsubscribe: (() => void) | null = null

onMounted(() => {
  const nonce = document.querySelector('meta[name="csp-nonce"]')?.getAttribute("content") ?? ""
  styleEl = document.createElement("style")
  if (nonce) styleEl.setAttribute("nonce", nonce)
  document.head.appendChild(styleEl)

  unsubscribe = trackScroll({ threshold }, (state) => {
    isVisible.value = state.isVisible
    scrollPercentage.value = state.scrollPercentage
  })
})

onUnmounted(() => {
  if (styleEl) styleEl.remove()
  unsubscribe?.()
})
</script>

<template>
  <div
    :data-rla-instance="instanceId"
    :class="['rla-scroll-to-top fixed bottom-6 right-6 z-50', { visible: isVisible }, classes.root]"
    v-bind="attrs"
  >
    <button type="button" :class="classes.button" aria-label="Scroll to top" @click="scrollToTopFn">
      <div :class="classes.progressBase">
        <div class="gauge-track"></div>
        <div v-if="showProgress" class="gauge-progress"></div>
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
  position: relative;
  transform: translateZ(0);
}

.gauge-track {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border-style: solid;
  border-width: var(--gauge-stroke-width, 3px);
  border-color: var(--gauge-track-border-color, var(--color-primary-900));
  background-color: var(--gauge-track-bg, var(--color-primary-950));
}

.gauge-progress {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    var(--gauge-color, var(--color-primary-500)) 0deg,
    var(--gauge-color, var(--color-primary-500)) calc(var(--gauge-progress, 0) * 3.6deg),
    transparent calc(var(--gauge-progress, 0) * 3.6deg)
  );
  -webkit-mask: radial-gradient(
    circle closest-side,
    transparent calc(100% - var(--gauge-stroke-width, 3px)),
    #000 calc(100% - var(--gauge-stroke-width, 3px))
  );
  mask: radial-gradient(
    circle closest-side,
    transparent calc(100% - var(--gauge-stroke-width, 3px)),
    #000 calc(100% - var(--gauge-stroke-width, 3px))
  );
}
</style>
