import type { Component } from "solid-js";
import type { RLScrollToTopProps } from "./scroll-to-top.types";
import { RLScrollToTopTheme } from "./scroll-to-top.theme";
import { createSignal, onSettled } from "solid-js";
import { trackScroll, scrollToTop } from "./scroll";
import { RLIcon } from "../icon/RLIcon";

const OMIT_KEYS = ["progressWidth", "duration", "threshold", "showProgress", "theme"] as const;

export const RLScrollToTop: Component<RLScrollToTopProps> = (props) => {
  const { classes, rest } = RLScrollToTopTheme.setup(props, { omit: OMIT_KEYS });

  const [isVisible, setIsVisible] = createSignal(false);
  const [scrollPercentage, setScrollPercentage] = createSignal(0);

  onSettled(() => {
    const unsubscribe = trackScroll({ threshold: props.threshold ?? 200 }, (state) => {
      setIsVisible(state.isVisible);
      setScrollPercentage(state.scrollPercentage);
    });
    return unsubscribe;
  });

  const color = () => props.color ?? "primary";
  const progressWidth = () => props.progressWidth ?? 6;
  const gaugeBorderWidth = () => progressWidth() * 0.5;

  const progressStyle = () => ({
    background: `conic-gradient(from 0deg, var(--rl-${color()}-500) 0deg, var(--rl-${color()}-500) ${scrollPercentage() * 3.6}deg, transparent ${scrollPercentage() * 3.6}deg)`,
    "-webkit-mask": `radial-gradient(circle closest-side, transparent calc(100% - ${gaugeBorderWidth()}px), #000 calc(100% - ${gaugeBorderWidth()}px))`,
    mask: `radial-gradient(circle closest-side, transparent calc(100% - ${gaugeBorderWidth()}px), #000 calc(100% - ${gaugeBorderWidth()}px))`,
  });

  const trackStyle = () => ({
    "border-width": `${gaugeBorderWidth()}px`,
    "border-color": `var(--rl-${color()}-900)`,
    "background-color": "#000",
  });

  return (
    <div
      class={`fixed bottom-6 right-6 z-50 transition-opacity duration-300 ${classes().root} ${
        isVisible() ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      data-slot="root"
      data-theme={props.theme}
      {...rest}
    >
      <button
        type="button"
        class={classes().button}
        aria-label="Scroll to top"
        data-scroll-to-top-button
        onClick={scrollToTop}
      >
        <div class={`relative size-full ${classes().progressBase}`}>
          <div class="absolute inset-0 rounded-full border-solid" style={trackStyle()} />
          {props.showProgress ? (
            <div
              class="absolute inset-0 rounded-full"
              data-gauge-progress
              style={progressStyle()}
            />
          ) : null}
          <div class={classes().iconContainer}>
            <RLIcon name="arrow-up" class={classes().icon} />
          </div>
        </div>
      </button>
    </div>
  );
};
