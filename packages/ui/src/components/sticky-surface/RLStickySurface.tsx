import type { Component } from "solid-js";
import type { RLStickySurfaceProps } from "./sticky-surface.types";
import { RLStickySurfaceTheme } from "./sticky-surface.theme";

const OMIT_KEYS = ["offsetTop", "zIndex", "style"] as const;

export const RLStickySurface: Component<RLStickySurfaceProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLStickySurfaceTheme.setup(props, {
    omit: OMIT_KEYS,
  });

  return (
    <Tag
      data-slot="root"
      data-theme={theme()}
      class={classes().root}
      style={{
        "--rl-sticky-top": `${props.offsetTop ?? 0}px`,
        "--rl-sticky-z": `${props.zIndex ?? 10}`,
      }}
      {...rest}
    >
      {children()}
    </Tag>
  );
};
