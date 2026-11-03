import type { Component } from "solid-js";
import type { RLChatToolProps } from "./chat-tool.types";
import { RLChatToolTheme } from "./chat-tool.theme";

export const RLChatTool: Component<RLChatToolProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLChatToolTheme.setup(props);

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      {children()}
    </Tag>
  );
};
