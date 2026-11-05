import type { Component } from "solid-js";
import { createMemo, createSignal, onSettled, Show } from "solid-js";
import type { RLScrollToTopProps } from "./scroll-to-top.types";
import { RLScrollToTopTheme } from "./scroll-to-top.theme";
import {
  DEFAULT_PROGRESS_WIDTH,
  DEFAULT_THRESHOLD,
  scrollToTop,
  trackScroll,
} from "./scroll-to-top.helpers";
import { RLButton } from "../button/RLButton";
import { RLIcon } from "../icon/RLIcon";
import { uiT } from "../../locale";

const OMIT_KEYS = ["progressWidth", "threshold", "hasProgress"] as const;

export const RLScrollToTop: Component<RLScrollToTopProps> = (props) => {
  const { Tag, classes, rest, theme, children } = RLScrollToTopTheme.setup(props, {
    omit: OMIT_KEYS,
  });

  const [isVisible, setIsVisible] = createSignal(false);
  const [scrollPercentage, setScrollPercentage] = createSignal(0);

  onSettled(() =>
    trackScroll(props.threshold ?? DEFAULT_THRESHOLD, (state) => {
      setIsVisible(state.isVisible);
      setScrollPercentage(state.scrollPercentage);
    }),
  );

  const color = createMemo(() => props.color ?? "primary");
  const borderPx = createMemo(() => `${(props.progressWidth ?? DEFAULT_PROGRESS_WIDTH) * 0.5}px`);
  const sweep = createMemo(() => `${(scrollPercentage() / 100) * 360}deg`);

  return (
    <Tag
      class={classes().root}
      data-slot="root"
      data-state={isVisible() ? "visible" : "hidden"}
      data-theme={theme()}
      {...rest}
    >
      <RLButton
        variant="unstyled"
        shape="bare"
        class={classes().button}
        aria-label={uiT("scroll-to-top.label")}
        data-slot="button"
        data-scroll-to-top-button
        onClick={scrollToTop}
      >
        <div
          class={classes().progressBase}
          data-slot="progress-base"
          style={{
            "--rl-stt-border": borderPx(),
            "--rl-stt-track": `var(--rl-${color()}-900)`,
            "--rl-stt-gauge": `conic-gradient(from 0deg, var(--rl-${color()}-500) ${sweep()}, transparent ${sweep()})`,
            "--rl-stt-mask": `radial-gradient(circle closest-side, transparent calc(100% - ${borderPx()}), black calc(100% - ${borderPx()}))`,
          }}
        >
          <div class={classes().track} data-slot="track" />
          <Show when={props.hasProgress !== false}>
            <div class={classes().progress} data-slot="progress" data-gauge-progress />
          </Show>
          <div class={classes().iconContainer} data-slot="icon-container">
            <Show
              when={children()}
              fallback={<RLIcon name="arrow-up" class={classes().icon} data-slot="icon" />}
            >
              {children()}
            </Show>
          </div>
        </div>
      </RLButton>
    </Tag>
  );
};
