import type { RLChatReasoningProps } from "./chat-reasoning.types";
import { RLChatReasoningTheme } from "./chat-reasoning.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLChatReasoning: Component<RLChatReasoningProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() =>
    RLChatReasoningTheme({
      ui: props.ui,
      class: props.class,
      ...props,
    }),
  );

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
