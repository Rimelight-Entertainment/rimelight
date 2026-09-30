import { createMemo, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { Dynamic } from "@solidjs/web";
import type { DashboardToolbarProps } from "./dashboard-toolbar";
import { dashboardToolbarTheme } from "./dashboard-toolbar.theme";

export interface RLDashboardToolbarProps extends DashboardToolbarProps {
  children?: JSX.Element;
  leftSlot?: JSX.Element;
  rightSlot?: JSX.Element;
}

const RLDashboardToolbar: Component<RLDashboardToolbarProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "as", "ui", "class", "children", "leftSlot", "rightSlot");

  const Tag = () => props.as || "div";

  const resolvedClasses = createMemo(() =>
    dashboardToolbarTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <Dynamic component={Tag()} class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children !== undefined ? (
        props.children
      ) : (
        <>
          <div data-slot="left" class={resolvedClasses().left}>
            {props.leftSlot}
          </div>
          <div data-slot="right" class={resolvedClasses().right}>
            {props.rightSlot}
          </div>
        </>
      )}
    </Dynamic>
  );
};

export { RLDashboardToolbar };
