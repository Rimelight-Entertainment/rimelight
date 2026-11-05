import type { Component } from "solid-js";
import type { RLChatMessagesProps } from "./chat-messages.types";
import { RLChatMessagesTheme } from "./chat-messages.theme";
import { uiT } from "../../locale";

const OMIT_KEYS = ["aria-label"] as const;

export const RLChatMessages: Component<RLChatMessagesProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLChatMessagesTheme.setup(props, {
    omit: OMIT_KEYS,
  });

  return (
    <Tag
      data-slot="root"
      data-theme={theme()}
      role="log"
      aria-label={props["aria-label"] ?? uiT("chat-messages.label")}
      class={classes().root}
      {...rest}
    >
      {children()}
    </Tag>
  );
};
