import { createMemo, createSignal, splitProps, onMount, onCleanup, type Component } from "solid-js"
import type { ScrollToTopProps } from "./scroll-to-top"
import { scrollToTopTheme } from "./scroll-to-top.theme"
import { trackScroll, scrollToTop } from "./scroll"
import RLIcon from "../icon/RLIcon"

export interface RLScrollToTopProps extends ScrollToTopProps {}

const RLScrollToTop: Component<RLScrollToTopProps> = (allProps) => {
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

  const progressStyle = () => ({
    "background": `conic-gradient(from 0deg, var(--rl-${color()}-500) 0deg, var(--rl-${color()}-500) ${scrollPercentage() * 3.6}deg, transparent ${scrollPercentage() * 3.6}deg)`,
    "-webkit-mask": `radial-gradient(circle closest-side, transparent calc(100% - ${gaugeBorderWidth()}px), #000 calc(100% - ${gaugeBorderWidth()}px))`,
    "mask": `radial-gradient(circle closest-side, transparent calc(100% - ${gaugeBorderWidth()}px), #000 calc(100% - ${gaugeBorderWidth()}px))`
  })

  const trackStyle = () => ({
    "border-width": `${gaugeBorderWidth()}px`,
    "border-color": `var(--rl-${color()}-900)`,
    "background-color": "#000"
  })

  return (
    <div
      class={`fixed bottom-6 right-6 z-50 transition-opacity duration-300 ${resolvedClasses().root} ${
        isVisible() ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      data-slot="root"
      data-theme={props.theme}
      {...rest}
    >
      <button
        type="button"
        class={resolvedClasses().button}
        aria-label="Scroll to top"
        data-scroll-to-top-button
        onClick={scrollToTop}
      >
        <div class={`relative size-full ${resolvedClasses().progressBase}`}>
          <div class="absolute inset-0 rounded-full border-solid" style={trackStyle()} />
          {props.showProgress ? (
            <div
              class="absolute inset-0 rounded-full"
              data-gauge-progress
              style={progressStyle()}
            />
          ) : null}
          <div class={resolvedClasses().iconContainer}>
            <RLIcon name="arrowUp" class={resolvedClasses().icon} />
          </div>
        </div>
      </button>
    </div>
  )
}

export { RLScrollToTop }
export default RLScrollToTop
