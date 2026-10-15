import type { RLChatProps } from "./chat.types";
import { RLChatTheme } from "./chat.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLChat: Component<RLChatProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() =>
    RLChatTheme({
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
