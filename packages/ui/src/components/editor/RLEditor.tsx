import { createMemo, omit, type Component } from "solid-js";
import type { RLEditorProps } from "./editor.types";
import { editorTheme } from "./editor.theme";

export const RLEditor: Component<RLEditorProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    editorTheme({
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
