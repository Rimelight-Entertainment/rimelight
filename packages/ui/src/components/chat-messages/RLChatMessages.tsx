import type { RLChatMessagesProps } from "./chat-messages.types";
import { RLChatMessagesTheme } from "./chat-messages.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLChatMessages: Component<RLChatMessagesProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() =>
    RLChatMessagesTheme({
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
