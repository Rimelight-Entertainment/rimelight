import type { Component } from "solid-js";
import type { RLChatPromptProps } from "./chat-prompt.types";
import { RLChatPromptTheme } from "./chat-prompt.theme";

export const RLChatPrompt: Component<RLChatPromptProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLChatPromptTheme.setup(props);

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      {children()}
    </Tag>
  );
};
