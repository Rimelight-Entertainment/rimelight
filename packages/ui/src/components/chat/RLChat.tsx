import { createMemo, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { ChatProps } from "./chat";
import { chatTheme } from "./chat.theme";

export interface RLChatProps extends ChatProps {
  children?: JSX.Element;
}

const RLChat: Component<RLChatProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    chatTheme({
      ui: props.ui,
      class: props.class,
      ...allProps
    })
  );

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};

export { RLChat };
