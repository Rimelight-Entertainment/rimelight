import { createMemo, omit, type Component } from "solid-js";
import type { RLChatPromptSubmitProps } from "./chat-prompt-submit";
import { chatPromptSubmitTheme } from "./chat-prompt-submit.theme";

export const RLChatPromptSubmit: Component<RLChatPromptSubmitProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    chatPromptSubmitTheme({
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
