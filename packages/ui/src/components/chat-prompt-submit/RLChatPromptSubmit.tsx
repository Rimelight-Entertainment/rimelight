import type { Component } from "solid-js";
import type { RLChatPromptSubmitProps } from "./chat-prompt-submit.types";
import { RLChatPromptSubmitTheme } from "./chat-prompt-submit.theme";

export const RLChatPromptSubmit: Component<RLChatPromptSubmitProps> = (props) => {
  const { classes, rest } = RLChatPromptSubmitTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
