import type { RLChatProps } from "./chat.types";
import { RLChatTheme } from "./chat.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLChat: Component<RLChatProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    RLChatTheme({
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
