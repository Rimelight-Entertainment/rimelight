import type { Component } from "solid-js";
import type { RLChatShimmerProps } from "./chat-shimmer.types";
import { RLChatShimmerTheme } from "./chat-shimmer.theme";

export const RLChatShimmer: Component<RLChatShimmerProps> = (props) => {
  const { classes, rest } = RLChatShimmerTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
