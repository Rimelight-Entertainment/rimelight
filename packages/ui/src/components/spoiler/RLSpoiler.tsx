import type { RLSpoilerProps } from "./spoiler.types";
import { RLSpoilerTheme } from "./spoiler.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLSpoiler: Component<RLSpoilerProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() =>
    RLSpoilerTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <div class={classes()["root"]} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
