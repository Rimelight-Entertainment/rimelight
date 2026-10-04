import { createMemo, omit, type Component } from "solid-js";
import type { RLPasswordProps } from "./password";
import { passwordTheme } from "./password.theme";

export const RLPassword: Component<RLPasswordProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    passwordTheme({
      ui: props.ui,
      class: props.class,
      ...allProps,
    }),
  );

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
