import type { RLFormProps } from "./form.types";
import { RLFormTheme } from "./form.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLForm: Component<RLFormProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "schema", "state", "ui", "class", "children", "onSubmit");

  const resolvedClasses = createMemo(() =>
    RLFormTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <form class={resolvedClasses().root} data-slot="root" onSubmit={props.onSubmit} {...rest}>
      {props.children}
    </form>
  );
};
