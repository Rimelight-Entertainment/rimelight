import type { RLEditorProps } from "./editor.types";
import { RLEditorTheme } from "./editor.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLEditor: Component<RLEditorProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    RLEditorTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
