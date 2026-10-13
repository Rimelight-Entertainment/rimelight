import type { RLMainProps } from "./main.types";
import { RLMainTheme } from "./main.theme";
import { createMemo, omit, type Component } from "solid-js";
import { dynamic } from "@solidjs/web";

export const RLMain: Component<RLMainProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "as", "ui", "class", "children");

  const Tag = dynamic(() => props.as ?? "main");

  const resolvedClasses = createMemo(() =>
    RLMainTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <Tag class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </Tag>
  );
};
