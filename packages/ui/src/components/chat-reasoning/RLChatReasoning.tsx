import type { RLChatReasoningProps } from "./chat-reasoning.types";
import { RLChatReasoningTheme } from "./chat-reasoning.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLChatReasoning: Component<RLChatReasoningProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    RLChatReasoningTheme({
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
