import type { Component } from "solid-js";
import type { RLChatProps } from "./chat.types";
import { RLChatTheme } from "./chat.theme";

export const RLChat: Component<RLChatProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLChatTheme.setup(props);

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      {children()}
    </Tag>
  );
};
