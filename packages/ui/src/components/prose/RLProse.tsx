import type { Component } from "solid-js";
import type { RLProseProps } from "./prose.types";
import { RLProseTheme } from "./prose.theme";

export const RLProse: Component<RLProseProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLProseTheme.setup(props);

  return (
    <Tag class={classes().root} data-slot="root" data-theme={theme()} {...rest}>
      {children()}
    </Tag>
  );
};
