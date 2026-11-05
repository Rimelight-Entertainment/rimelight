import type { Component } from "solid-js";
import { Show } from "solid-js";
import type { RLChatPromptProps } from "./chat-prompt.types";
import { RLChatPromptTheme } from "./chat-prompt.theme";
import { isSubmitKey } from "./chat-prompt.helpers";
import { createControllable } from "../../controllable";
import { uiT } from "../../locale";
import { RLTextarea } from "../textarea/RLTextarea";

const OMIT_KEYS = [
  "value",
  "defaultValue",
  "onValueChange",
  "onSubmit",
  "placeholder",
  "name",
  "disabled",
  "aria-label",
] as const;

export const RLChatPrompt: Component<RLChatPromptProps> = (props) => {
  const [text, setText] = createControllable<string>(
    () => props.value,
    props.defaultValue ?? "",
    (next) => props.onValueChange?.(next),
  );
  const { Tag, classes, rest, children, theme } = RLChatPromptTheme.setup(props, {
    as: () => "form",
    omit: OMIT_KEYS,
  });

  const submit = () => {
    const trimmed = text().trim();
    if (trimmed === "" || props.disabled) return;
    props.onSubmit?.(trimmed);
    setText("");
  };

  return (
    <Tag
      data-slot="root"
      data-theme={theme()}
      class={classes().root}
      onSubmit={(event: SubmitEvent) => {
        event.preventDefault();
        submit();
      }}
      {...rest}
    >
      <RLTextarea
        class={classes().input}
        value={text()}
        onValueChange={setText}
        name={props.name}
        placeholder={props.placeholder ?? uiT("chat-prompt.placeholder")}
        disabled={props.disabled}
        aria-label={props["aria-label"] ?? uiT("chat-prompt.label")}
        autoGrow
        rows={1}
        onKeyDown={(event) => {
          if (!isSubmitKey(event)) return;
          event.preventDefault();
          submit();
        }}
      />
      <Show when={children()}>
        <div data-slot="footer" class={classes().footer}>
          {children()}
        </div>
      </Show>
    </Tag>
  );
};
