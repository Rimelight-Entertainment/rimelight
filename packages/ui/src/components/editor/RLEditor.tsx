import type { Component } from "solid-js";
import type { RLEditorProps } from "./editor.types";
import { RLEditorTheme } from "./editor.theme";

export const RLEditor: Component<RLEditorProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLEditorTheme.setup(props);

  return (
    <Tag class={classes().root} data-slot="root" data-theme={theme()} {...rest}>
      {children()}
    </Tag>
  );
};
