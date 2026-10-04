import { createMemo, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { ChatShimmerProps } from "./chat-shimmer";
import { chatShimmerTheme } from "./chat-shimmer.theme";

export interface RLChatShimmerProps extends ChatShimmerProps {
  children?: JSX.Element;
}

export const RLChatShimmer: Component<RLChatShimmerProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    chatShimmerTheme({
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
