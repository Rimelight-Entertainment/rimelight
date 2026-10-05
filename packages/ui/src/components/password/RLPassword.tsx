import type { RLPasswordProps } from "./password.types";
import { RLPasswordTheme } from "./password.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLPassword: Component<RLPasswordProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    RLPasswordTheme({
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
