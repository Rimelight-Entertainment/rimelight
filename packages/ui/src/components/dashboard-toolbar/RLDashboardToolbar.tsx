import type { Component } from "solid-js";
import type { RLDashboardToolbarProps } from "./dashboard-toolbar.types";
import { RLDashboardToolbarTheme } from "./dashboard-toolbar.theme";

const OMIT_KEYS = ["leftSlot", "rightSlot"] as const;

export const RLDashboardToolbar: Component<RLDashboardToolbarProps> = (props) => {
  const { Tag, classes, rest } = RLDashboardToolbarTheme.setup(props, {
    omit: OMIT_KEYS,
    as: "div",
  });

  return (
    <Tag class={classes().root} data-slot="root" {...rest}>
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
    </Tag>
  );
};
