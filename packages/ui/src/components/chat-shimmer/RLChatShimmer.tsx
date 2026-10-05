import type { RLChatShimmerProps } from "./chat-shimmer.types";
import { RLChatShimmerTheme } from "./chat-shimmer.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLChatShimmer: Component<RLChatShimmerProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    RLChatShimmerTheme({
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
