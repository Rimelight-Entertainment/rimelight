import type { RLListboxProps } from "./listbox.types";
import { RLListboxTheme } from "./listbox.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLListbox: Component<RLListboxProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    RLListboxTheme({
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
