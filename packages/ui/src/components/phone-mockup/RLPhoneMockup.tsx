import type { RLPhoneMockupProps } from "./phone-mockup.types";
import { RLPhoneMockupTheme } from "./phone-mockup.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLPhoneMockup: Component<RLPhoneMockupProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    RLPhoneMockupTheme({
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
