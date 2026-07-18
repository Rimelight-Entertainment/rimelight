<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useAttrs } from "vue"
import { scv } from "css-variants"
import { useUi, resolveClasses } from "../../utils"
import type { BannerProps } from "./banner"
import bannerTheme from "./banner.theme"
import { getHeaderStack } from "../../utils/headerStack"

const attrs = useAttrs()
const banner = scv(bannerTheme)

const {
  contain = true,
  sticky = false,
  fixed = true,
  stackIndex = 0,
  hideOnScroll = true,
  dismissable = false,
  dismissId,
  actions = [],
  ui: uiProp,
  class: className
} = defineProps<BannerProps>()

defineSlots<{
  default(props: {}): any
  left(props: {}): any
  center(props: {}): any
  right(props: {}): any
  actions(props: {}): any
}>()

const resolvedClasses = computed(() =>
  resolveClasses(banner, { contain, sticky, fixed }, useUi("banner", uiProp), className)
)

const id = `rlv-banner-${Math.random().toString(36).slice(2, 8)}`
const storageKey = dismissId || id
const rootRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const naturalHeight = ref(0)
const isVisible = ref(true)
const closed = ref(false)
const showActions = ref(false)

const fixedStyle = computed(() => {
  if (!fixed) return {}
  return {
    zIndex: 200 - stackIndex
  }
})

let resizeObserver: ResizeObserver | null = null
let scrollHandler: (() => void) | null = null

onMounted(() => {
  if (dismissable) {
    const stored = localStorage.getItem(`rl-banner-dismiss-${storageKey}`)
    if (stored === "true") {
      closed.value = true
      return
    }
  }

  if (!fixed) return

  const stack = getHeaderStack()

  const updateStack = () => {
    stack.register(id, stackIndex, naturalHeight.value, isVisible.value, rootRef.value, "banner")
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

function handleClose() {
  localStorage.setItem(`rl-banner-dismiss-${storageKey}`, "true")
  closed.value = true
  if (fixed) getHeaderStack().unregister(id)
}

function handleActionClick(action: any) {
  if (action.onClick) action.onClick()
}
</script>

<template>
  <div
    v-if="!closed"
    ref="rootRef"
    :id="id"
    :class="[resolvedClasses.root]"
    :style="fixedStyle"
    data-slot="root"
    v-bind="attrs"
  >
    <div ref="contentRef" :class="resolvedClasses.content">
      <div :class="resolvedClasses.container">
        <div v-show="!showActions" :class="resolvedClasses.left" data-slot="left">
          <slot name="left" />
        </div>
        <div v-show="!showActions" :class="resolvedClasses.center" data-slot="center">
          <slot name="center">
            <slot />
          </slot>
        </div>

        <div class="flex-1"></div>

        <div :class="resolvedClasses.side">
          <slot name="right" />
        </div>

        <template v-if="actions.length > 0 || !!$slots.actions">
          <button
            class="flex-none flex items-center justify-center size-7 rounded-md hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer md:hidden text-sm leading-none"
            :class="showActions ? 'order-first' : ''"
            :aria-label="showActions ? 'Hide actions' : 'Show actions'"
            @click="showActions = !showActions"
          >
            ···
          </button>
          <div
            :class="[
              resolvedClasses.actions,
              'flex-row items-center justify-center gap-2',
              showActions ? 'flex order-first' : 'hidden',
              'md:flex'
            ]"
          >
            <slot name="actions">
              <template v-for="(action, i) in actions" :key="i">
                <a
                  v-if="action.href"
                  :key="`a-${i}`"
                  :href="action.href"
                  :class="[
                    'inline-flex items-center justify-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition-colors no-underline cursor-pointer shrink-0',
                    action.variant === 'solid' || !action.variant
                      ? 'bg-foreground text-background hover:opacity-90'
                      : 'bg-white/20 text-white hover:bg-white/30',
                    action.class
                  ]"
                  @click="handleActionClick(action)"
                >
                  {{ action.label }}
                </a>
                <button
                  v-else
                  :key="`b-${i}`"
                  :class="[
                    'inline-flex items-center justify-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer shrink-0',
                    action.variant === 'solid' || !action.variant
                      ? 'bg-foreground text-background hover:opacity-90'
                      : 'bg-white/20 text-white hover:bg-white/30',
                    action.class
                  ]"
                  @click="handleActionClick(action)"
                >
                  {{ action.label }}
                </button>
              </template>
            </slot>
          </div>
        </template>

        <button
          v-if="dismissable"
          :class="[resolvedClasses.dismiss]"
          aria-label="Close banner"
          type="button"
          @click="handleClose"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
