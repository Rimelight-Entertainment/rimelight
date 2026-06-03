<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useAttrs } from "vue"
import { scv } from "css-variants"
import { useUi, resolveClasses } from "../../utils"
import type { HeaderProps } from "../../types/components/header"
import headerTheme from "../../themes/header.theme"
import { getHeaderStack } from "../../utils/headerStack"

const attrs = useAttrs()
const header = scv(headerTheme)

const {
  contain = true,
  sticky = true,
  fixed = false,
  stackIndex = 0,
  hideOnScroll = false,
  ui: uiProp,
  class: className
} = defineProps<HeaderProps>()

defineSlots<{
  left(props: {}): any
  center(props: {}): any
  right(props: {}): any
}>()

const resolvedClasses = computed(() =>
  resolveClasses(header, { contain, sticky, fixed }, useUi("header", uiProp), className)
)

const id = `rlv-header-${Math.random().toString(36).slice(2, 8)}`
const rootRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const naturalHeight = ref(0)
const isVisible = ref(true)

const fixedStyle = computed(() => {
  if (!fixed) return {}
  return {
    zIndex: 100 - stackIndex
  }
})

let resizeObserver: ResizeObserver | null = null
let scrollHandler: (() => void) | null = null

onMounted(() => {
  if (!fixed) return

  const stack = getHeaderStack()

  const updateStack = () => {
    stack.register(id, stackIndex, naturalHeight.value, isVisible.value, rootRef.value)
  }

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

  if (hideOnScroll) {
    let localLastScrollY = window.scrollY
    scrollHandler = () => {
      const current = window.scrollY
      const diff = current - localLastScrollY

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
    :class="[resolvedClasses.root]"
    :style="fixedStyle"
    data-slot="root"
    v-bind="attrs"
  >
    <div ref="contentRef" :class="resolvedClasses.content">
      <div :class="resolvedClasses.container">
        <div :class="resolvedClasses.left" data-slot="left">
          <slot name="left" />
        </div>
        <div :class="resolvedClasses.center" data-slot="center">
          <slot name="center" />
        </div>
        <div :class="resolvedClasses.right" data-slot="right">
          <slot name="right" />
        </div>
      </div>
    </div>
  </header>
</template>
