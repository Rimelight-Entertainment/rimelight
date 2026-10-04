import { createMemo, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { ListboxProps } from "./listbox";
import { listboxTheme } from "./listbox.theme";

export interface RLListboxProps extends ListboxProps {
  children?: JSX.Element;
}

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
