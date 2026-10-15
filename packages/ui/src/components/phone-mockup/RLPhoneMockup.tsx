import type { RLPhoneMockupProps } from "./phone-mockup.types";
import { RLPhoneMockupTheme } from "./phone-mockup.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLPhoneMockup: Component<RLPhoneMockupProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() =>
    RLPhoneMockupTheme({
      ui: props.ui,
      class: props.class,
      ...props,
    }),
  );

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
