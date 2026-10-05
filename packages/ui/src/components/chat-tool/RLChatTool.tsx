import type { RLChatToolProps } from "./chat-tool.types";
import { RLChatToolTheme } from "./chat-tool.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLChatTool: Component<RLChatToolProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    RLChatToolTheme({
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
