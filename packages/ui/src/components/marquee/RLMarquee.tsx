import { createMemo, type Component } from "solid-js";
import type { RLMarqueeProps } from "./marquee.types";
import { RLMarqueeTheme } from "./marquee.theme";

const OMIT_KEYS = ["speed", "gap", "style", "reverse"] as const;

export const RLMarquee: Component<RLMarqueeProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLMarqueeTheme.setup(props, {
    omit: OMIT_KEYS,
  });

  const orientation = createMemo(() => props.orientation ?? "horizontal");
  const reverse = createMemo(() => props.reverse === true);
  const pauseOnHover = createMemo(() => props.pauseOnHover ?? true);

  // Runtime values only: the gap and speed are variables read by the theme's root and track slots.
  const gapValue = () =>
    props.gap === undefined
      ? undefined
      : typeof props.gap === "number"
        ? `${props.gap}px`
        : `${props.gap}`;

  return (
    <Tag
      data-slot="root"
      data-theme={theme()}
      data-orientation={orientation()}
      data-reverse={reverse() ? "" : undefined}
      data-pause-on-hover={pauseOnHover() ? "" : undefined}
      class={classes().root}
      style={{
        "--marquee-gap": gapValue(),
        "--rl-marquee-speed": props.speed === undefined ? undefined : `${props.speed}s`,
      }}
      {...rest}
    >
      <div class={classes().track} data-slot="track">
        {children()}
      </div>
      <div class={classes().track} data-slot="track" aria-hidden="true">
        {children()}
      </div>
    </Tag>
  );
};
