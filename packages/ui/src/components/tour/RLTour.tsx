import type { RLTourProps } from "./tour.types";
import { RLTourTheme } from "./tour.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLTour: Component<RLTourProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    RLTourTheme({
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
