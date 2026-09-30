import { createMemo, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { ChatToolProps } from "./chat-tool";
import { chatToolTheme } from "./chat-tool.theme";

export interface RLChatToolProps extends ChatToolProps {
  children?: JSX.Element;
}

const RLChatTool: Component<RLChatToolProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    chatToolTheme({
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

export { RLChatTool };
