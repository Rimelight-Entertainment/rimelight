import type { RLProseProps } from "./prose.types";
import { RLProseTheme } from "./prose.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLProse: Component<RLProseProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const classes = createMemo(() =>
    RLProseTheme({
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
