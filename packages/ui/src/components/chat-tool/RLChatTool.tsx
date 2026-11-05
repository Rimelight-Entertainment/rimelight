import type { Component } from "solid-js";
import type { RLChatToolProps } from "./chat-tool.types";
import { RLChatToolTheme } from "./chat-tool.theme";
import { uiT } from "../../locale";

const OMIT_KEYS = ["toolName", "status", "defaultOpen"] as const;

export const RLChatTool: Component<RLChatToolProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLChatToolTheme.setup(props, {
    as: () => "details",
    omit: OMIT_KEYS,
  });

  return (
    <Tag
      data-slot="root"
      data-theme={theme()}
      data-status={props.status ?? "pending"}
      open={props.defaultOpen}
      class={classes().root}
      {...rest}
    >
      <summary data-slot="trigger" class={classes().trigger}>
        <span data-slot="name" class={classes().name}>
          {props.toolName ?? ""}
        </span>
        <span data-slot="status" class={classes().status}>
          {uiT(`chat-tool.status.${props.status ?? "pending"}`)}
        </span>
      </summary>
      <div data-slot="body" class={classes().body}>
        {children()}
      </div>
    </Tag>
  );
};
