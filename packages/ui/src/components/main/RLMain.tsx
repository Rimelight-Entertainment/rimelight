import type { RLMainProps } from "./main.types";
import { RLMainTheme } from "./main.theme";
import { createMemo, omit, type Component, isStatic } from "solid-js";
import { dynamic } from "@solidjs/web";

export const RLMain: Component<RLMainProps> = (props) => {
  const rest = omit(props, "as", "ui", "class", "children");

  const Tag = dynamic(() => props.as ?? "main", { static: isStatic(props, "as") });

  const classes = createMemo(() =>
    RLMainTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <Tag class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </Tag>
  );
};
