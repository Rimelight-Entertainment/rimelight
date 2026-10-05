import type { RLMarqueeProps } from "./marquee.types";
import { RLMarqueeTheme } from "./marquee.theme";
import { createMemo, omit, type Component } from "solid-js";

const MARQUEE_KEYFRAMES = `
@keyframes marquee-left {
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
}
@keyframes marquee-right {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
@keyframes marquee-up {
  from { transform: translateY(0); }
  to { transform: translateY(-100%); }
}
@keyframes marquee-down {
  from { transform: translateY(-100%); }
  to { transform: translateY(0); }
}
.animate-marquee,
.animate-marquee-left {
  animation: marquee-left 30s linear infinite;
}
.animate-marquee-right {
  animation: marquee-right 30s linear infinite;
}
.animate-marquee-up {
  animation: marquee-up 30s linear infinite;
}
.animate-marquee-down {
  animation: marquee-down 30s linear infinite;
}
`;

export const RLMarquee: Component<RLMarqueeProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "speed", "direction", "pauseOnHover", "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    RLMarqueeTheme({
      direction: props.direction ?? "left",
      pauseOnHover: props.pauseOnHover ?? true,
      ui: props.ui,
      class: props.class,
    }),
  );

  const trackStyle = () => ({ "animation-duration": `${props.speed ?? 40}s` });

  return (
    <div class={resolvedClasses().root} data-slot="marquee-root" {...rest}>
      <div class={resolvedClasses().track} data-slot="track" style={trackStyle()}>
        {props.children}
      </div>
      <div
        class={resolvedClasses().track}
        data-slot="track"
        style={trackStyle()}
        aria-hidden="true"
      >
        {props.children}
      </div>
      <style>{MARQUEE_KEYFRAMES}</style>
    </div>
  );
};
