import type { Component } from "solid-js";
import type { RLStickySurfaceProps } from "./sticky-surface.types";
import { RLStickySurfaceTheme } from "./sticky-surface.theme";

const OMIT_KEYS = ["offsetTop", "zIndex"] as const;

export const RLStickySurface: Component<RLStickySurfaceProps> = (props) => {
  const { Tag, classes, rest, id, children, theme } = RLStickySurfaceTheme.setup(props, {
    idPrefix: "sticky",
    omit: OMIT_KEYS,
  });

  const stickyId = id();

  return (
    <Tag data-slot="root" data-theme={theme()} class={`${classes().root} ${stickyId}`} {...rest}>
      {children()}
      <style>{`
        .${stickyId} {
          top: ${props.offsetTop ?? 0}px !important;
          z-index: ${props.zIndex ?? 10} !important;
          container-type: scroll-state;
          container-name: rl-sticky-${stickyId};
        }
      `}</style>
      <style>{`
        @container rl-sticky-${stickyId} scroll-state(stuck: top) {
          .${stickyId}.rl-sticky-shadow {
            box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.10), 0 1px 4px 0 rgba(0, 0, 0, 0.06);
            border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          }
        }

        @media (prefers-color-scheme: dark) {
          @container rl-sticky-${stickyId} scroll-state(stuck: top) {
            .${stickyId}.rl-sticky-shadow {
              box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.40), 0 1px 4px 0 rgba(0, 0, 0, 0.20);
              border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            }
          }
        }
      `}</style>
    </Tag>
  );
};
