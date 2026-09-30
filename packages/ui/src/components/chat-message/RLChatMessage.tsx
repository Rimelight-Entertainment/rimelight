import { createMemo, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { ChatMessageProps } from "./chat-message";
import { chatMessageTheme } from "./chat-message.theme";

export interface RLChatMessageProps extends ChatMessageProps {
  children?: JSX.Element;
}

const RLChatMessage: Component<RLChatMessageProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    chatMessageTheme({
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

export { RLChatMessage };
