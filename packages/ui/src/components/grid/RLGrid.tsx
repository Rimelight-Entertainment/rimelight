import { createMemo, omit, type Component } from "solid-js";
import type { RLGridProps } from "./grid.types";
import { gridTheme } from "./grid.theme";

export const RLGrid: Component<RLGridProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "cols", "stagger", "gap", "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    gridTheme({
      cols: props.cols ?? 2,
      gap: props.gap ?? "md",
      stagger: props.stagger ?? false,
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <div class={resolvedClasses().root} {...rest}>
      {props.children}
    </div>
  );
};
