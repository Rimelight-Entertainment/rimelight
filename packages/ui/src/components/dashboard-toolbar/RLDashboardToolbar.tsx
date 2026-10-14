import type { RLDashboardToolbarProps } from "./dashboard-toolbar.types";
import { RLDashboardToolbarTheme } from "./dashboard-toolbar.theme";
import { createMemo, omit, type Component } from "solid-js";
import { dynamic } from "@solidjs/web";

export const RLDashboardToolbar: Component<RLDashboardToolbarProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "as", "ui", "class", "children", "leftSlot", "rightSlot");

  const Root = dynamic(() => props.as ?? "div");

  const resolvedClasses = createMemo(() =>
    RLDashboardToolbarTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <Root class={resolvedClasses().root} data-slot="root" {...rest}>
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
    </Root>
  );
};
