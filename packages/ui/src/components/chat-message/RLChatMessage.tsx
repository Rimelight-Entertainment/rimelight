import type { Component } from "solid-js";
import type { RLChatMessageProps } from "./chat-message.types";
import { RLChatMessageTheme } from "./chat-message.theme";

export const RLChatMessage: Component<RLChatMessageProps> = (props) => {
  const { classes, rest } = RLChatMessageTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
