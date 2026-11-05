import type { Component } from "solid-js";
import type { RLChatPromptSubmitProps } from "./chat-prompt-submit.types";
import { RLChatPromptSubmitTheme } from "./chat-prompt-submit.theme";
import { uiT } from "../../locale";
import { RLButton } from "../button/RLButton";

const OMIT_KEYS = ["status", "onStop", "disabled", "aria-label"] as const;

export const RLChatPromptSubmit: Component<RLChatPromptSubmitProps> = (props) => {
  const { classes, rest, theme, tagProp } = RLChatPromptSubmitTheme.setup(props, {
    omit: OMIT_KEYS,
  });

  return (
    <RLButton
      as={tagProp()}
      data-slot="root"
      data-theme={theme()}
      type={props.status === "streaming" ? "button" : "submit"}
      icon={props.status === "streaming" ? "square" : "send"}
      loading={props.status === "submitted"}
      disabled={props.disabled}
      onClick={props.status === "streaming" ? props.onStop : undefined}
      aria-label={
        props["aria-label"] ??
        (props.status === "streaming"
          ? uiT("chat-prompt-submit.stop")
          : uiT("chat-prompt-submit.send"))
      }
      class={classes().root}
      {...rest}
    />
  );
};
