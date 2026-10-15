import type { RLDashboardToolbarProps } from "./dashboard-toolbar.types";
import { RLDashboardToolbarTheme } from "./dashboard-toolbar.theme";
import { createMemo, omit, type Component } from "solid-js";
import { dynamic } from "@solidjs/web";

export const RLDashboardToolbar: Component<RLDashboardToolbarProps> = (props) => {
  const rest = omit(props, "as", "ui", "class", "children", "leftSlot", "rightSlot");

  const Root = dynamic(() => props.as ?? "div");

  const classes = createMemo(() =>
    RLDashboardToolbarTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <Root class={classes().root} data-slot="root" {...rest}>
      {props.children !== undefined ? (
        props.children
      ) : (
        <>
          <div data-slot="left" class={classes().left}>
            {props.leftSlot}
          </div>
          <div data-slot="right" class={classes().right}>
            {props.rightSlot}
          </div>
        </>
      )}
    </Root>
  );
};
