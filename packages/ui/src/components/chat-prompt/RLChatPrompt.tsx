import { createMemo, omit, type Component } from "solid-js";
import type { RLChatPromptProps } from "./chat-prompt";
import { chatPromptTheme } from "./chat-prompt.theme";

export const RLChatPrompt: Component<RLChatPromptProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    chatPromptTheme({
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
