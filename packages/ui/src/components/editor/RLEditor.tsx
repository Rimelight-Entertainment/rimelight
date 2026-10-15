import type { RLEditorProps } from "./editor.types";
import { RLEditorTheme } from "./editor.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLEditor: Component<RLEditorProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() =>
    RLEditorTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
