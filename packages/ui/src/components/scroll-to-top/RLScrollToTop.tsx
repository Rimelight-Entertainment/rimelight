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

  // Runtime gauge values only; the ring styling itself lives in the theme's track/progress slots.
  const gaugeVars = () => ({
    "--rl-stt-border": `${gaugeBorderWidth()}px`,
    "--rl-stt-track": `var(--rl-${color()}-900)`,
    "--rl-stt-gauge": `conic-gradient(from 0deg, var(--rl-${color()}-500) 0deg, var(--rl-${color()}-500) ${scrollPercentage() * 3.6}deg, transparent ${scrollPercentage() * 3.6}deg)`,
    "--rl-stt-mask": `radial-gradient(circle closest-side, transparent calc(100% - ${gaugeBorderWidth()}px), #000 calc(100% - ${gaugeBorderWidth()}px))`,
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
        <div class={`relative size-full ${classes().progressBase}`} style={gaugeVars()}>
          <div class={classes().track} />
          {showProgress() ? <div class={classes().progress} data-gauge-progress /> : null}
          <div class={classes().iconContainer}>
            <RLIcon name="arrow-up" class={classes().icon} />
          </div>
        </div>
      </button>
    </Tag>
  );
};
