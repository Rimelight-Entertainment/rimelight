import type { Component } from "solid-js";
import { createMemo, createSignal, onSettled, Show } from "solid-js";
import type { RLScrollToTopProps } from "./scroll-to-top.types";
import { RLScrollToTopTheme } from "./scroll-to-top.theme";
import {
  DEFAULT_PROGRESS_WIDTH,
  DEFAULT_THRESHOLD,
  gaugeVars,
  scrollToTop,
  trackScroll,
} from "./scroll-to-top.helpers";
import { RLIcon } from "../icon/RLIcon";
import { RLButton } from "../button/RLButton";
import { uiT } from "../../locale";

const OMIT_KEYS = ["progressWidth", "threshold", "hasProgress"] as const;

export const RLScrollToTop: Component<RLScrollToTopProps> = (props) => {
  const { Tag, classes, rest, theme, children } = RLScrollToTopTheme.setup(props, {
    omit: OMIT_KEYS,
  });

  const [isVisible, setIsVisible] = createSignal(false);
  const [scrollPercentage, setScrollPercentage] = createSignal(0);

  const gauge = createMemo(() =>
    gaugeVars(props.progressWidth ?? DEFAULT_PROGRESS_WIDTH, scrollPercentage()),
  );

  onSettled(() =>
    trackScroll(props.threshold ?? DEFAULT_THRESHOLD, (state) => {
      setIsVisible(state.isVisible);
      setScrollPercentage(state.scrollPercentage);
    }),
  );

  return (
    <Tag
      class={classes().root}
      data-slot="root"
      data-theme={theme()}
      data-state={isVisible() ? "visible" : "hidden"}
      {...rest}
    >
      <RLButton
        type="button"
        class={classes().button}
        aria-label={uiT("scroll-to-top.label")}
        data-slot="button"
        onClick={scrollToTop}
      >
        <div
          class={classes().progressBase}
          data-slot="progress-base"
          style={{
            "--rl-stt-border": gauge()["--rl-stt-border"],
            "--rl-stt-gauge": gauge()["--rl-stt-gauge"],
          }}
        >
          <div class={classes().track} data-slot="track" />
          <Show when={props.hasProgress ?? true}>
            <div class={classes().progress} data-slot="progress" />
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
