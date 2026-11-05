import type { Component } from "solid-js";
import { Show } from "solid-js";
import type { RLChatReasoningProps } from "./chat-reasoning.types";
import { RLChatReasoningTheme } from "./chat-reasoning.theme";
import { uiT } from "../../locale";
import { RLChatShimmer } from "../chat-shimmer/RLChatShimmer";

const OMIT_KEYS = ["label", "streaming", "defaultOpen"] as const;

export const RLChatReasoning: Component<RLChatReasoningProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLChatReasoningTheme.setup(props, {
    as: () => "details",
    omit: OMIT_KEYS,
  });

  return (
    <Tag
      data-slot="root"
      data-theme={theme()}
      data-streaming={props.streaming ? "" : undefined}
      open={props.defaultOpen}
      class={classes().root}
      {...rest}
    >
      <summary data-slot="trigger" class={classes().trigger}>
        <Show when={props.streaming} fallback={props.label ?? uiT("chat-reasoning.label")}>
          <RLChatShimmer>{props.label ?? uiT("chat-reasoning.label")}</RLChatShimmer>
        </Show>
      </summary>
      <div data-slot="body" class={classes().body}>
        {children()}
      </div>
    </Tag>
  );
};
