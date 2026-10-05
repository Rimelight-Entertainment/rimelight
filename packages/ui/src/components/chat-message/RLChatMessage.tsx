import type { RLChatMessageProps } from "./chat-message.types";
import { RLChatMessageTheme } from "./chat-message.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLChatMessage: Component<RLChatMessageProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    RLChatMessageTheme({
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
