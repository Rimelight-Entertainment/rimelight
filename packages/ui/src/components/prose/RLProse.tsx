import { createMemo, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { ProseProps } from "./prose";
import { proseTheme } from "./prose.theme";

export interface RLProseProps extends ProseProps {
  children?: JSX.Element;
}

const RLProse: Component<RLProseProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const classes = createMemo(() =>
    proseTheme({
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

export { RLProse };
