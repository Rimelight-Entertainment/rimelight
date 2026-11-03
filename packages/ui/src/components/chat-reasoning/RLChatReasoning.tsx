import type { Component } from "solid-js";
import type { RLChatReasoningProps } from "./chat-reasoning.types";
import { RLChatReasoningTheme } from "./chat-reasoning.theme";

export const RLChatReasoning: Component<RLChatReasoningProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLChatReasoningTheme.setup(props);

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      {children()}
    </Tag>
  );
};
