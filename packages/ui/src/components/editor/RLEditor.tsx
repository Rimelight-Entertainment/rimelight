import type { Component } from "solid-js";
import type { RLEditorProps } from "./editor.types";
import { RLEditorTheme } from "./editor.theme";

export const RLEditor: Component<RLEditorProps> = (props) => {
  const { classes, rest } = RLEditorTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
