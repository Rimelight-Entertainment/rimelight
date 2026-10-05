import { createMemo, omit, type Component } from "solid-js";
import type { RLChatReasoningProps } from "./chat-reasoning.types";
import { chatReasoningTheme } from "./chat-reasoning.theme";

export const RLChatReasoning: Component<RLChatReasoningProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    chatReasoningTheme({
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
