import type { Component } from "solid-js";
import type { RLChatShimmerProps } from "./chat-shimmer.types";
import { RLChatShimmerTheme } from "./chat-shimmer.theme";

export const RLChatShimmer: Component<RLChatShimmerProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLChatShimmerTheme.setup(props);

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      {children()}
    </Tag>
  );
};
