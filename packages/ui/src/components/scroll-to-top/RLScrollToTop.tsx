import type { Component } from "solid-js";
import { createSignal, onSettled } from "solid-js";
import type { RLScrollToTopProps } from "./scroll-to-top.types";
import { RLScrollToTopTheme } from "./scroll-to-top.theme";
import { scrollToTop, trackScroll } from "./scroll";
import { RLIcon } from "../icon/RLIcon";
import { uiT } from "../../locale";

const OMIT_KEYS = ["progressWidth", "threshold", "showProgress"] as const;

export const RLScrollToTop: Component<RLScrollToTopProps> = (props) => {
  const { Tag, classes, rest, theme } = RLScrollToTopTheme.setup(props, { omit: OMIT_KEYS });

  const [isVisible, setIsVisible] = createSignal(false);
  const [scrollPercentage, setScrollPercentage] = createSignal(0);

  onSettled(() => {
    return trackScroll({ threshold: props.threshold ?? 200 }, (state) => {
      setIsVisible(state.isVisible);
      setScrollPercentage(state.scrollPercentage);
    });
  });

  const color = () => props.color ?? "primary";
  const showProgress = () => props.showProgress ?? true;
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
    <Tag
      class={`transition-opacity duration-300 ${classes().root} ${
        isVisible() ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      data-slot="root"
      data-theme={theme()}
      {...rest}
    >
      <button
        type="button"
        class={classes().button}
        aria-label={uiT("scroll-to-top.label")}
        data-scroll-to-top-button
        onClick={scrollToTop}
      >
        <div class={`relative size-full ${classes().progressBase}`}>
          <div class="absolute inset-0 rounded-full border-solid" style={trackStyle()} />
          {showProgress() ? (
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
    </Tag>
  );
};
