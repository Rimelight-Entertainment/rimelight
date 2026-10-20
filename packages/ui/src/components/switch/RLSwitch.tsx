import type { Component } from "solid-js";
import type { RLSwitchProps } from "./switch.types";
import { RLSwitchTheme } from "./switch.theme";

const OMIT_KEYS = ["disabled", "name", "label", "value", "trailing"] as const;

export const RLSwitch: Component<RLSwitchProps> = (props) => {
  const { classes, rest } = RLSwitchTheme.setup(props, { omit: OMIT_KEYS });

  return (
    <label class={classes().root} data-slot="root" data-theme={props.theme} {...rest}>
      <input
        type="checkbox"
        class={classes().input}
        checked={!!props.checked}
        disabled={props.disabled}
        name={props.name}
      />
      <div class={classes().track} data-slot="track">
        <div class={classes().thumb} data-slot="thumb" />
      </div>
      {props.label !== undefined && props.label !== null ? (
        <span class={classes().label} data-slot="label">
          {props.label}
        </span>
      ) : props.children ? (
        <span class={classes().label} data-slot="label">
          {props.children}
        </span>
      ) : null}
    </label>
  );
};
