<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue"
import { scv, cx } from "css-variants"
import { twMerge } from "tailwind-merge"
import { useUi } from "@/composables"
import headerTheme from "@/themes/header.theme"
import { getHeaderStack } from "@/utils/headerStack"

// ── Style engine ─────────────────────────────────────────────────────────────

const header = scv({
  slots: [...headerTheme.slots],
  base: headerTheme.base,
  variants: headerTheme.variants,
  defaultVariants: headerTheme.defaultVariants,
  classNameResolver: (...args) => twMerge(cx(...args))
})

// ── Props ─────────────────────────────────────────────────────────────────────

export interface RLVHeaderProps {
  /**
   * Whether to contain the header content in a max-width container.
   *
   * @default true
   */
  contain?: boolean
  /**
   * Sticky positioning when `fixed` is false.
   *
   * @default true
   */
  sticky?: boolean
  /**
   * Switches to `position: fixed; left: 0; right: 0` (layer mode). When true, `top` and
   * `stackIndex` control the exact position.
   *
   * @default false
   */
  fixed?: boolean
  /**
   * Controls z-index when `fixed` is true: `z-index = 100 - stackIndex`. Lower index = higher in
   * the visual stack.
   *
   * @default 0
   */
  stackIndex?: number
  /**
   * When true, hides the header on scroll-down and shows it on scroll-up. Uses a passive `scroll`
   * event listener — no external dependencies. Only meaningful when `fixed` is true.
   *
   * @default false
   */
  hideOnScroll?: boolean
  /**
   * UI overrides for individual slots, derived from the header theme.
   */
  ui?: Partial<Record<keyof typeof headerTheme.base, string>>
  /**
   * External class — applied to the root element.
   */
  class?: string
}

const {
  contain = true,
  sticky = true,
  fixed = false,
  stackIndex = 0,
  hideOnScroll = false,
  class: className,
  ui: uiProp
} = defineProps<RLVHeaderProps>()

// ── Slots ─────────────────────────────────────────────────────────────────────

defineSlots<{
  /**
   * Content to display on the left side of the header (e.g., Logo).
   */
  left(props: {}): any
  /**
   * Content to display in the center of the header (e.g., Navigation Links).
   */
  center(props: {}): any
  /**
   * Content to display on the right side of the header (e.g., User Menu, Theme Toggle).
   */
  right(props: {}): any
}>()

// ── UI merge ──────────────────────────────────────────────────────────────────

const mergedUI = useUi("header", uiProp as Record<string, unknown> | undefined)

// ── Resolved classes ──────────────────────────────────────────────────────────

const resolvedClasses = computed(() => {
  const classes = header({ contain, sticky, fixed })
  return {
    root: twMerge(classes.root, mergedUI.value.root as string | undefined),
    content: twMerge(classes.content, mergedUI.value.content as string | undefined),
    container: twMerge(classes.container, mergedUI.value.container as string | undefined),
    left: twMerge(classes.left, mergedUI.value.left as string | undefined),
    center: twMerge(classes.center, mergedUI.value.center as string | undefined),
    right: twMerge(classes.right, mergedUI.value.right as string | undefined)
  }
})

// ── Fixed-mode state ──────────────────────────────────────────────────────────

const id = `rlv-header-${Math.random().toString(36).slice(2, 8)}`
const rootRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const naturalHeight = ref(0)
const isVisible = ref(true)

/**
 * Inline style applied to the root element in fixed mode.
 */
const fixedStyle = computed(() => {
  if (!fixed) return {}
  return {
    zIndex: 100 - stackIndex
  }
})

// ── Lifecycle: height measurement + scroll listener ───────────────────────────

let resizeObserver: ResizeObserver | null = null
let scrollHandler: (() => void) | null = null

onMounted(() => {
  if (!fixed) return

  const stack = getHeaderStack()

  const updateStack = () => {
    stack.register(id, stackIndex, naturalHeight.value, isVisible.value, rootRef.value)
  }

  // Measure natural height via ResizeObserver
  if (contentRef.value) {
    naturalHeight.value = contentRef.value.getBoundingClientRect().height
    resizeObserver = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect.height
      if (h && h > 0) {
        naturalHeight.value = h
        updateStack()
      }
    })
    resizeObserver.observe(contentRef.value)
  }

  // Raw scroll listener for hideOnScroll
  if (hideOnScroll) {
    let localLastScrollY = window.scrollY
    scrollHandler = () => {
      const current = window.scrollY
      const diff = current - localLastScrollY

      // Ignore tiny jitter
      if (Math.abs(diff) < 10) return

      const newVisible = current <= 50 ? true : diff <= 0
      if (newVisible !== isVisible.value) {
        isVisible.value = newVisible
        updateStack()
      }

      localLastScrollY = current
    }

    window.addEventListener("scroll", scrollHandler, { passive: true })
  }

  updateStack()
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  if (scrollHandler) window.removeEventListener("scroll", scrollHandler)
  if (fixed) getHeaderStack().unregister(id)
})
</script>

<template>
  <header
    ref="rootRef"
    :id="id"
    :class="[resolvedClasses.root, className]"
    :style="fixedStyle"
    data-slot="rlv-header"
    v-bind="$attrs"
  >
    <!--
      content wrapper: always rendered, but only meaningful in fixed mode.
      The ResizeObserver targets this element so the `<header>` root's padding/border
      don't interfere with the height measurement.
    -->
    <div ref="contentRef" :class="resolvedClasses.content">
      <div :class="resolvedClasses.container">
        <div :class="resolvedClasses.left" data-slot="header-left">
          <slot name="left" />
        </div>
        <div :class="resolvedClasses.center" data-slot="header-center">
          <slot name="center" />
        </div>
        <div :class="resolvedClasses.right" data-slot="header-right">
          <slot name="right" />
        </div>
      </div>
    </div>
  </header>
</template>
