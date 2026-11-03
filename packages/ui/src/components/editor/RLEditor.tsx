import type { Component } from "solid-js";
import type { RLEditorProps } from "./editor.types";
import { RLEditorTheme } from "./editor.theme";

export const RLEditor: Component<RLEditorProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLEditorTheme.setup(props);

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      {children()}
    </Tag>
  );
};
