import type { RLChatMessageProps } from "./chat-message.types";
import { RLChatMessageTheme } from "./chat-message.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLChatMessage: Component<RLChatMessageProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() =>
    RLChatMessageTheme({
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
