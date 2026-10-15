import type { RLChatPromptProps } from "./chat-prompt.types";
import { RLChatPromptTheme } from "./chat-prompt.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLChatPrompt: Component<RLChatPromptProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() =>
    RLChatPromptTheme({
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
