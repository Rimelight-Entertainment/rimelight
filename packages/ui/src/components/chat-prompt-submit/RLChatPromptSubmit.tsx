import type { Component } from "solid-js";
import type { RLChatPromptSubmitProps } from "./chat-prompt-submit.types";
import { RLChatPromptSubmitTheme } from "./chat-prompt-submit.theme";

export const RLChatPromptSubmit: Component<RLChatPromptSubmitProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLChatPromptSubmitTheme.setup(props);

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      {children()}
    </Tag>
  );
};
