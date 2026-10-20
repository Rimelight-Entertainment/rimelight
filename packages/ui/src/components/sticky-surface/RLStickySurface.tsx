import type { Component } from "solid-js";
import { createUniqueId, Show } from "solid-js";
import type { RLStickySurfaceProps } from "./sticky-surface.types";
import { RLStickySurfaceTheme } from "./sticky-surface.theme";

const OMIT_KEYS = ["stuckShadow", "offsetTop", "zIndex"] as const;

export const RLStickySurface: Component<RLStickySurfaceProps> = (props) => {
  const { classes, rest } = RLStickySurfaceTheme.setup(props, { omit: OMIT_KEYS });

  const stuckShadow = () => props.stuckShadow ?? true;
  const id = `sticky-${createUniqueId()}`;

  return (
    <div
      class={`${classes().root}  ${id}  ${stuckShadow() ? "rl-sticky-shadow" : ""}`}
      data-slot="root"
      {...rest}
    >
      {props.children}
      <style>{`
        .${id} {
          top: ${props.offsetTop ?? 0}px !important;
          z-index: ${props.zIndex ?? 10} !important;
          container-type: scroll-state;
          container-name: rl-sticky-${id};
        }
      `}</style>
      <Show when={stuckShadow()}>
        <style>{`
          @container rl-sticky-${id} scroll-state(stuck: top) {
            .${id} {
              box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.10), 0 1px 4px 0 rgba(0, 0, 0, 0.06);
              border-bottom: 1px solid rgba(0, 0, 0, 0.06);
            }
          }

          @media (prefers-color-scheme: dark) {
            @container rl-sticky-${id} scroll-state(stuck: top) {
              .${id} {
                box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.40), 0 1px 4px 0 rgba(0, 0, 0, 0.20);
                border-bottom: 1px solid rgba(255, 255, 255, 0.06);
              }
            }
          }
        `}</style>
      </Show>
    </div>
  );
};
