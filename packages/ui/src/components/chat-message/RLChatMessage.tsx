import type { Component } from "solid-js";
import type { RLChatMessageProps } from "./chat-message.types";
import { RLChatMessageTheme } from "./chat-message.theme";

export const RLChatMessage: Component<RLChatMessageProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLChatMessageTheme.setup(props);

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      {children()}
    </Tag>
  );
};
