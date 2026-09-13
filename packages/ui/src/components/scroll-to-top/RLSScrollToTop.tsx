import { createMemo, createSignal, splitProps, onMount, onCleanup, type Component } from "solid-js"
import type { ScrollToTopProps } from "./scroll-to-top"
import { scrollToTopTheme } from "./scroll-to-top.theme"
import { trackScroll, scrollToTop } from "./scroll"

export interface RLSScrollToTopProps extends ScrollToTopProps {}

const SCROLL_TO_TOP_CSS = `
.rla-scroll-to-top-inner {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease-in-out;
}
.rla-scroll-to-top-inner.js-visible {
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
}
.gauge-progress {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    var(--gauge-color, var(--rl-primary-500)) 0deg,
    var(--gauge-color, var(--rl-primary-500)) calc(var(--gauge-progress, 0) * 3.6deg),
    transparent calc(var(--gauge-progress, 0) * 3.6deg)
  );
  -webkit-mask: radial-gradient(
    circle closest-side,
    transparent calc(100% - var(--gauge-stroke-width, 6px)),
    #000 calc(100% - var(--gauge-stroke-width, 6px))
  );
  mask: radial-gradient(
    circle closest-side,
    transparent calc(100% - var(--gauge-stroke-width, 6px)),
    #000 calc(100% - var(--gauge-stroke-width, 6px))
  );
}
`

const RLSScrollToTop: Component<RLSScrollToTopProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "color",
    "progressWidth",
    "duration",
    "threshold",
    "showProgress",
    "theme",
    "ui",
    "class"
  ])

  const [isVisible, setIsVisible] = createSignal(false)
  const [scrollPercentage, setScrollPercentage] = createSignal(0)

  onMount(() => {
    const unsubscribe = trackScroll({ threshold: props.threshold ?? 200 }, (state) => {
      setIsVisible(state.isVisible)
      setScrollPercentage(state.scrollPercentage)
    })
    onCleanup(unsubscribe)
  })

  const resolvedClasses = createMemo(() =>
    scrollToTopTheme({
      color: props.color ?? "primary",
      ui: props.ui,
      class: props.class
    })
  )

  const color = () => props.color ?? "primary"
  const progressWidth = () => props.progressWidth ?? 6
  const gaugeBorderWidth = () => progressWidth() * 0.5

  const progressStyle = () =>
    ({
      "--gauge-stroke-width": `${gaugeBorderWidth()}px`,
      "--gauge-color": `var(--rl-${color()}-500)`,
      "--gauge-progress": String(scrollPercentage())
    }) as Record<string, string>

  const trackStyle = () =>
    ({
      "border-width": `${gaugeBorderWidth()}px`,
      "border-color": `var(--rl-${color()}-900)`,
      "background-color": "#000"
    }) as Record<string, string>

  return (
    <div
      class={`rla-scroll-to-top-inner scroll-to-top-inner fixed bottom-6 right-6 z-50 ${resolvedClasses().root} ${
        isVisible() ? "js-visible" : ""
      }`}
      data-slot="root"
      {...rest}
    >
      <button
        type="button"
        class={resolvedClasses().button}
        aria-label="Scroll to top"
        data-scroll-to-top-button
        onClick={scrollToTop}
      >
        <div class={resolvedClasses().progressBase}>
          <div class="gauge-track" style={trackStyle()} />
          {props.showProgress ? (
            <div class="gauge-progress" data-gauge-progress style={progressStyle()} />
          ) : null}
          <div class={resolvedClasses().iconContainer}>
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
              class={resolvedClasses().icon}
            >
              <path d="m5 12 7-7 7 7" />
              <path d="M12 19V5" />
            </svg>
          </div>
        </div>
      </button>
      <style>{SCROLL_TO_TOP_CSS}</style>
    </div>
  )
}

export default RLSScrollToTop
