import { createMemo, omit, type Component } from "solid-js";
import type { RLTourProps } from "./tour";
import { tourTheme } from "./tour.theme";

export const RLTour: Component<RLTourProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    tourTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
