import type { Component } from "solid-js";
import type { RLChatProps } from "./chat.types";
import { RLChatTheme } from "./chat.theme";

export const RLChat: Component<RLChatProps> = (props) => {
  const { classes, rest } = RLChatTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
