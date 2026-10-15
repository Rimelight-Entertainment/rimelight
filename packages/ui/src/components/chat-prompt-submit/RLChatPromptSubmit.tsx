import type { RLChatPromptSubmitProps } from "./chat-prompt-submit.types";
import { RLChatPromptSubmitTheme } from "./chat-prompt-submit.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLChatPromptSubmit: Component<RLChatPromptSubmitProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() =>
    RLChatPromptSubmitTheme({
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
