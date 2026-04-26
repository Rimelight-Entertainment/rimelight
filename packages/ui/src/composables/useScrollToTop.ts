import { ref, onMounted, onUnmounted, type Ref } from "vue"

export interface UseScrollToTopOptions {
  /**
   * The scroll threshold (in pixels) before the button becomes visible.
   *
   * @default 200
   */
  threshold?: number
}

export interface UseScrollToTopReturn {
  /**
   * Whether the scroll-to-top button should be visible.
   */
  isVisible: Ref<boolean>
  /**
   * The current scroll percentage (0-100).
   */
  scrollPercentage: Ref<number>
  /**
   * Scrolls the window to the top with a smooth animation.
   */
  scrollToTop: () => void
}

export function useScrollToTop(options: UseScrollToTopOptions = {}): UseScrollToTopReturn {
  const { threshold = 200 } = options

  const isVisible = ref(false)
  const scrollPercentage = ref(0)

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

  return {
    isVisible,
    scrollPercentage,
    scrollToTop
  }
}
