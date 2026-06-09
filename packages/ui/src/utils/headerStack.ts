export interface HeaderLayer {
  id: string
  type: "banner" | "header"
  order: number
  naturalHeight: number
  isVisible: boolean
  el: HTMLElement | null
}

export interface HeaderStackManager {
  layers: HeaderLayer[]
  register: (
    id: string,
    order: number,
    naturalHeight: number,
    isVisible: boolean,
    el: HTMLElement | null,
    type?: "banner" | "header"
  ) => void
  unregister: (id: string) => void
  update: () => void
}

declare global {
  interface Window {
    RLHeaderStack?: HeaderStackManager
  }
}

/**
 * Initializes and returns a global vanilla JS header stack manager. This ensures Vue and Astro
 * components share the exact same layer state and can dynamically push each other up/down when
 * hiding on scroll.
 */
export function getHeaderStack(): HeaderStackManager {
  if (typeof window === "undefined") {
    // SSR stub
    return {
      layers: [],
      register() {},
      unregister() {},
      update() {}
    }
  }

  if (!window.RLHeaderStack) {
    window.RLHeaderStack = {
      layers: [] as HeaderLayer[],
      register(
        id: string,
        order: number,
        naturalHeight: number,
        isVisible: boolean,
        el: HTMLElement | null,
        type: "banner" | "header" = "header"
      ) {
        let layer = this.layers.find((l: HeaderLayer) => l.id === id)
        if (!layer) {
          layer = { id, type, order, naturalHeight, isVisible, el }
          this.layers.push(layer)
          this.layers.sort((a: HeaderLayer, b: HeaderLayer) => {
            if (a.type !== b.type) return a.type === "banner" ? -1 : 1
            return a.order - b.order
          })
        } else {
          layer.naturalHeight = naturalHeight
          layer.isVisible = isVisible
          layer.el = el
        }
        this.update()
      },
      unregister(id: string) {
        this.layers = this.layers.filter((l: HeaderLayer) => l.id !== id)
        this.update()
      },
      update() {
        let currentTop = 0
        for (const layer of this.layers) {
          if (layer.el) {
            // If hidden, slide it up out of view (or exactly to its negative height so it's ready to slide down)
            const topPx = layer.isVisible ? `${currentTop}px` : `-${layer.naturalHeight}px`
            layer.el.style.top = topPx
            layer.el.style.opacity = layer.isVisible ? "1" : "0"
            layer.el.style.pointerEvents = layer.isVisible ? "auto" : "none"
            layer.el.style.setProperty(
              "--rl-header-bottom",
              `calc(${topPx} + ${layer.naturalHeight}px)`
            )
          }
          if (layer.isVisible) {
            currentTop += layer.naturalHeight
          }
        }
        if (currentTop > 0) {
          document.documentElement.style.setProperty("--rl-total-header-height", `${currentTop}px`)
        }
      }
    }
  }
  return window.RLHeaderStack
}
