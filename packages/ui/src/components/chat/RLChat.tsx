import type { Component } from "solid-js";
import type { RLChatProps } from "./chat.types";
import { RLChatTheme } from "./chat.theme";
import { uiT } from "../../locale";

const OMIT_KEYS = ["status", "aria-label"] as const;

export const RLChat: Component<RLChatProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLChatTheme.setup(props, { omit: OMIT_KEYS });

  return (
    <Tag
      data-slot="root"
      data-theme={theme()}
      role="region"
      aria-label={props["aria-label"] ?? uiT("chat.label")}
      aria-busy={props.status === "submitted" || props.status === "streaming" ? "true" : undefined}
      class={classes().root}
      {...rest}
    >
      {children()}
    </Tag>
  );
};
