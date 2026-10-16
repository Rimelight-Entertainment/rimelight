import type { RLContainerProps } from "./container.types";
import { RLContainerTheme } from "./container.theme";
import { createMemo, omit, type Component, isStatic } from "solid-js";
import { dynamic } from "@solidjs/web";

export const RLContainer: Component<RLContainerProps> = (props) => {
  const rest = omit(props, "as", "ui", "class", "children");

  // Hoisted per instance (<Dynamic> is deprecated: it rebuilds a fresh
  // factory at every call site).
  const Tag = dynamic(() => props.as ?? "div", { static: isStatic(props, "as") });

  const classes = createMemo(() => RLContainerTheme({ ui: props.ui, class: props.class }));

  return (
    <Tag class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </Tag>
  );
};
