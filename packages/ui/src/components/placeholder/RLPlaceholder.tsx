import type { Component } from "solid-js";
import type { RLPlaceholderProps } from "./placeholder.types";
import { RLPlaceholderTheme } from "./placeholder.theme";

export const RLPlaceholder: Component<RLPlaceholderProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLPlaceholderTheme.setup(props);

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      <svg class={classes().svg}>
        <defs>
          <pattern
            id="pattern-5c1e4f0e-62d5-498b-8ff0-cf77bb448c8e"
            x="0"
            y="0"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <path d="M-3 13 15-5M-5 5l18-18M-1 21 17 3" />
          </pattern>
        </defs>
        <rect
          stroke="none"
          fill="url(#pattern-5c1e4f0e-62d5-498b-8ff0-cf77bb448c8e)"
          width="100%"
          height="100%"
        />
      </svg>

      {children()}
    </Tag>
  );
};
