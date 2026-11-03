import type { Component } from "solid-js";
import type { RLChatMessagesProps } from "./chat-messages.types";
import { RLChatMessagesTheme } from "./chat-messages.theme";

export const RLChatMessages: Component<RLChatMessagesProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLChatMessagesTheme.setup(props);

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      {children()}
    </Tag>
  );
};
