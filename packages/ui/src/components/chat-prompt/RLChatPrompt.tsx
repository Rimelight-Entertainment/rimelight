import type { RLChatPromptProps } from "./chat-prompt.types";
import { RLChatPromptTheme } from "./chat-prompt.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLChatPrompt: Component<RLChatPromptProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    RLChatPromptTheme({
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
