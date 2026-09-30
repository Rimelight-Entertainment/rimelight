import { createMemo, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { SpoilerProps } from "./spoiler";
import { spoilerTheme } from "./spoiler.theme";

export interface RLSpoilerProps extends SpoilerProps {
  children?: JSX.Element;
}

const RLSpoiler: Component<RLSpoilerProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const classes = createMemo(() =>
    spoilerTheme({
      ui: props.ui,
      class: props.class
    })
  );

  return (
    <div class={classes()["root"]} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};

export { RLSpoiler };
