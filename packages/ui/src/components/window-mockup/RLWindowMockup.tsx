import type { RLWindowMockupProps } from "./window-mockup.types";
import { RLWindowMockupTheme } from "./window-mockup.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLWindowMockup: Component<RLWindowMockupProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    RLWindowMockupTheme({
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
