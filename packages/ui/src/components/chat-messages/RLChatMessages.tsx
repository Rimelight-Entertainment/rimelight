import type { Component } from "solid-js";
import type { RLChatMessagesProps } from "./chat-messages.types";
import { RLChatMessagesTheme } from "./chat-messages.theme";

export const RLChatMessages: Component<RLChatMessagesProps> = (props) => {
  const { classes, rest } = RLChatMessagesTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
