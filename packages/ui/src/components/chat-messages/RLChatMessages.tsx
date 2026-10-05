import type { RLChatMessagesProps } from "./chat-messages.types";
import { RLChatMessagesTheme } from "./chat-messages.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLChatMessages: Component<RLChatMessagesProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    RLChatMessagesTheme({
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
