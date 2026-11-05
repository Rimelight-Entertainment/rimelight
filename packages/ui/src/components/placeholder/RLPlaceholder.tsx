import type { Component } from "solid-js";
import type { RLPlaceholderProps } from "./placeholder.types";
import { RLPlaceholderTheme } from "./placeholder.theme";

export const RLPlaceholder: Component<RLPlaceholderProps> = (props) => {
  const { Tag, classes, rest, id, children, theme } = RLPlaceholderTheme.setup(props, {
    idPrefix: "rl-placeholder",
  });

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      <svg class={classes().svg}>
        <defs>
          <pattern
            id={`${id()}-pattern`}
            x="0"
            y="0"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <path d="M-3 13 15-5M-5 5l18-18M-1 21 17 3" />
          </pattern>
        </defs>
        <rect stroke="none" fill={`url(#${id()}-pattern)`} width="100%" height="100%" />
      </svg>

      {children()}
    </Tag>
  );
};
