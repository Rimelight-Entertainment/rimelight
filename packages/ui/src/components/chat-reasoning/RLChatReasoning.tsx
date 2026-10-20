import type { Component } from "solid-js";
import type { RLChatReasoningProps } from "./chat-reasoning.types";
import { RLChatReasoningTheme } from "./chat-reasoning.theme";

export const RLChatReasoning: Component<RLChatReasoningProps> = (props) => {
  const { classes, rest } = RLChatReasoningTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
