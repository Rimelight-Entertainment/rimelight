export interface ScrollState {
  isVisible: boolean
  scrollPercentage: number
}

export function trackScroll(
  options: { threshold?: number } = {},
  onUpdate: (state: ScrollState) => void
): () => void {
  if (typeof window === "undefined") {
    onUpdate({ isVisible: false, scrollPercentage: 0 })
    return () => {}
  }

  const { threshold = 200 } = options

  let ticking = false

  function update() {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
        onUpdate({
          isVisible: scrollTop > threshold,
          scrollPercentage: scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0
        })
        ticking = false
      })
      ticking = true
    }
  }

  window.addEventListener("scroll", update, { passive: true })
  update()

  return () => {
    window.removeEventListener("scroll", update)
  }
}

export function scrollToTop() {
  if (typeof window !== "undefined") {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }
}
