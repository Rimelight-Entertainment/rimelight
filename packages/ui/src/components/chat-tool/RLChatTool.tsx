import type { Component } from "solid-js";
import type { RLChatToolProps } from "./chat-tool.types";
import { RLChatToolTheme } from "./chat-tool.theme";

export const RLChatTool: Component<RLChatToolProps> = (props) => {
  const { classes, rest } = RLChatToolTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
