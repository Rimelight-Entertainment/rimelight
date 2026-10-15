import type { RLChatToolProps } from "./chat-tool.types";
import { RLChatToolTheme } from "./chat-tool.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLChatTool: Component<RLChatToolProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() =>
    RLChatToolTheme({
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
