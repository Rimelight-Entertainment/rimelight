import type { Component } from "solid-js";
import type { RLMarqueeProps } from "./marquee.types";
import { RLMarqueeTheme } from "./marquee.theme";

const MARQUEE_KEYFRAMES = `
@keyframes marquee-left {
  from { transform: translateX(0); }
  to { transform: translateX(calc(-100% - var(--marquee-gap, 1rem))); }
}
@keyframes marquee-right {
  from { transform: translateX(calc(-100% - var(--marquee-gap, 1rem))); }
  to { transform: translateX(0); }
}
@keyframes marquee-up {
  from { transform: translateY(0); }
  to { transform: translateY(calc(-100% - var(--marquee-gap, 1rem))); }
}
@keyframes marquee-down {
  from { transform: translateY(calc(-100% - var(--marquee-gap, 1rem))); }
  to { transform: translateY(0); }
}
.animate-marquee,
.animate-marquee-left {
  animation: marquee-left 40s linear infinite;
}
.animate-marquee-right {
  animation: marquee-right 40s linear infinite;
}
.animate-marquee-up {
  animation: marquee-up 40s linear infinite;
}
.animate-marquee-down {
  animation: marquee-down 40s linear infinite;
}
`;

const OMIT_KEYS = ["speed", "direction", "pauseOnHover", "gap"] as const;

export const RLMarquee: Component<RLMarqueeProps> = (props) => {
  const { classes, rest } = RLMarqueeTheme.setup(props, { omit: OMIT_KEYS });

  const trackStyle = () => ({ "animation-duration": `${props.speed ?? 40}s` });

  const rootStyle = () => {
    const styleObj: Record<string, string> = {};
    if (props.gap !== undefined) {
      const gapVal = typeof props.gap === "number" ? `${props.gap}px` : `${props.gap}`;
      styleObj["--marquee-gap"] = gapVal;
      styleObj["gap"] = gapVal;
    }
    const restStyle = rest["style"];
    if (typeof restStyle === "object" && restStyle !== null) {
      Object.assign(styleObj, restStyle);
    }
    return Object.keys(styleObj).length > 0 ? styleObj : undefined;
  };

  return (
    <div class={classes().root} data-slot="marquee-root" style={rootStyle()} {...rest}>
      <div class={classes().track} data-slot="track" style={trackStyle()}>
        {props.children}
      </div>
      <div class={classes().track} data-slot="track" style={trackStyle()} aria-hidden="true">
        {props.children}
      </div>
      <style>{MARQUEE_KEYFRAMES}</style>
    </div>
  );
};
