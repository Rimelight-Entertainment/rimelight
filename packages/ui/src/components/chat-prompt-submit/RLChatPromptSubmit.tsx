import type { RLChatPromptSubmitProps } from "./chat-prompt-submit.types";
import { RLChatPromptSubmitTheme } from "./chat-prompt-submit.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLChatPromptSubmit: Component<RLChatPromptSubmitProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    RLChatPromptSubmitTheme({
      ui: props.ui,
      class: props.class,
      ...allProps,
    }),
  );

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
