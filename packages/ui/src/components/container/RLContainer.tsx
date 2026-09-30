import { createMemo, omit, type Component } from "solid-js";
import { dynamic, type JSX } from "@solidjs/web";
import type { ContainerProps } from "./container";
import { containerTheme } from "./container.theme";

export interface RLContainerProps extends ContainerProps {
  children?: JSX.Element;
}

const RLContainer: Component<RLContainerProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "as", "ui", "class", "children");

  // Hoisted per instance (<Dynamic> is deprecated: it rebuilds a fresh
  // factory at every call site).
  const Tag = dynamic(() => props.as ?? "div");

  const resolvedClasses = createMemo(() => containerTheme({ ui: props.ui, class: props.class }));

  return (
    <Tag class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </Tag>
  );
};

export { RLContainer };
