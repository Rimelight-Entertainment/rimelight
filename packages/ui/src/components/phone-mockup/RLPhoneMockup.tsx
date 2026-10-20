import type { Component } from "solid-js";
import type { RLPhoneMockupProps } from "./phone-mockup.types";
import { RLPhoneMockupTheme } from "./phone-mockup.theme";

export const RLPhoneMockup: Component<RLPhoneMockupProps> = (props) => {
  const { classes, rest } = RLPhoneMockupTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
