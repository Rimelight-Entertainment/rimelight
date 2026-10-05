import { createMemo, omit, type Component } from "solid-js";
import type { RLFieldGroupProps } from "./field-group.types";
import { fieldGroupTheme } from "./field-group.theme";

export const RLFieldGroup: Component<RLFieldGroupProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "prepend", "append", "size", "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    fieldGroupTheme({
      size: props["size"] ?? "md",
      ui: props["ui"],
      class: props["class"],
    }),
  );

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.prepend ? (
        <div class={resolvedClasses().prepend} data-slot="prepend">
          {props.prepend}
        </div>
      ) : null}
      {props.children}
      {props.append ? (
        <div class={resolvedClasses().append} data-slot="append">
          {props.append}
        </div>
      ) : null}
    </div>
  );
};
