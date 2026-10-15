import type { RLChatShimmerProps } from "./chat-shimmer.types";
import { RLChatShimmerTheme } from "./chat-shimmer.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLChatShimmer: Component<RLChatShimmerProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() =>
    RLChatShimmerTheme({
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
