import type { Component } from "solid-js";
import type { RLPhoneMockupProps } from "./phone-mockup.types";
import { RLPhoneMockupTheme } from "./phone-mockup.theme";

export const RLPhoneMockup: Component<RLPhoneMockupProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLPhoneMockupTheme.setup(props);

  return (
    <Tag class={classes().root} data-slot="root" data-theme={theme()} {...rest}>
      {children()}
    </Tag>
  );
};
