import type { Component } from "solid-js";
import type { RLStickySurfaceProps } from "./sticky-surface.types";
import { RLStickySurfaceTheme } from "./sticky-surface.theme";

const OMIT_KEYS = ["offsetTop", "zIndex", "style"] as const;

export const RLStickySurface: Component<RLStickySurfaceProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLStickySurfaceTheme.setup(props, {
    omit: OMIT_KEYS,
  });

  // Runtime offsets are the only inline values; the sticky rules themselves live in the theme.
  const offsetStyle = () => ({
    "--rl-sticky-top": `${props.offsetTop ?? 0}px`,
    "--rl-sticky-z": `${props.zIndex ?? 10}`,
  });

  return (
    <Tag
      data-slot="root"
      data-theme={theme()}
      class={classes().root}
      style={offsetStyle()}
      {...rest}
    >
      {children()}
    </Tag>
  );
};
