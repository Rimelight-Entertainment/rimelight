import { createMemo, omit, type Component } from "solid-js";
import type { RLUserProps } from "./user.types";
import { userTheme } from "./user.theme";

export const RLUser: Component<RLUserProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const classes = createMemo(() =>
    userTheme({
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
