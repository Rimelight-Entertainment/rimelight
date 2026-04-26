<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue"

export interface RLVScrollToTopProps {
  color?: "primary" | "secondary"
  circleStrokeWidth?: number
  duration?: number
  threshold?: number
  ui?: Record<string, string>
  class?: string
}

const {
  circleStrokeWidth = 4,
  duration = 0.1,
  threshold = 200,
  class: className,
} = defineProps<RLVScrollToTopProps>()

const isVisible = ref(false)
const scrollPercentage = ref(0)

const circumference = 2 * Math.PI * 45
const percentPx = circumference / 100

function updateScrollState() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight

  isVisible.value = scrollTop > threshold
  scrollPercentage.value = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  })
}

onMounted(() => {
  window.addEventListener("scroll", updateScrollState, { passive: true })
  updateScrollState()
})

onUnmounted(() => {
  window.removeEventListener("scroll", updateScrollState)
})
</script>

<template>
  <Transition
    name="fade"
    enter-active-class="transition-opacity duration-300 ease-in"
    leave-active-class="transition-opacity duration-300 ease-out"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div v-if="isVisible" class="fixed bottom-6 right-6 z-50">
      <button
        type="button"
        class="size-14 lg:size-12 p-0 rounded-full hover:scale-110 transition-transform"
        aria-label="Scroll to top"
        @click="scrollToTop"
      >
        <div class="size-full relative">
          <svg class="size-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="var(--color-primary-950)"
              :stroke-width="circleStrokeWidth"
              stroke-dashoffset="0"
              stroke-linecap="round"
              class="stroke-secondary opacity-100"
              style="stroke: var(--color-primary-900); stroke-dasharray: var(--circumference); transform: rotate(-90deg); transform-origin: center;"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              :stroke-width="circleStrokeWidth"
              stroke-dashoffset="0"
              stroke-linecap="round"
              class="stroke-primary opacity-100"
              :style="`stroke: var(--color-primary-500); stroke-dasharray: ${(scrollPercentage / 100) * percentPx}px ${circumference}px; transform: rotate(-90deg); transform-origin: center; transition: stroke-dasharray ${duration}s ease, stroke ${duration}s ease;`"
            />
          </svg>
          <div class="absolute inset-0 flex items-center justify-center text-center">
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
              class="size-6 text-white"
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
