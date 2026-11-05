import type { Component } from "solid-js";
import type { RLMarqueeProps } from "./marquee.types";
import { RLMarqueeTheme } from "./marquee.theme";

const OMIT_KEYS = ["speed", "gap", "style"] as const;

export const RLMarquee: Component<RLMarqueeProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLMarqueeTheme.setup(props, {
    omit: OMIT_KEYS,
  });

  // Runtime values only: the gap and speed are variables read by the theme's root and track slots.
  const rootStyle = () => ({
    "--marquee-gap":
      props.gap === undefined
        ? undefined
        : typeof props.gap === "number"
          ? `${props.gap}px`
          : `${props.gap}`,
    "--rl-marquee-speed": props.speed === undefined ? undefined : `${props.speed}s`,
  });

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} style={rootStyle()} {...rest}>
      <div class={classes().track} data-slot="track">
        {children()}
      </div>
      <div class={classes().track} data-slot="track" aria-hidden="true">
        {children()}
      </div>
    </Tag>
  );
};
