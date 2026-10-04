import { createMemo, omit, type Component } from "solid-js";
import type { RLListboxProps } from "./listbox";
import { listboxTheme } from "./listbox.theme";

export const RLListbox: Component<RLListboxProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    listboxTheme({
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
