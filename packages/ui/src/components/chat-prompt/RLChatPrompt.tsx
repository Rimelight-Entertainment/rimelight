import type { Component } from "solid-js";
import type { RLChatPromptProps } from "./chat-prompt.types";
import { RLChatPromptTheme } from "./chat-prompt.theme";

export const RLChatPrompt: Component<RLChatPromptProps> = (props) => {
  const { classes, rest } = RLChatPromptTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
