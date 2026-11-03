import { Show, type Component } from "solid-js";
import type { RLSwitchProps } from "./switch.types";
import { RLSwitchTheme } from "./switch.theme";
import { createControllable } from "../../controllable";

export const RLSwitch: Component<RLSwitchProps> = (props) => {
  const [checked, setChecked] = createControllable<boolean>(
    () => props.checked,
    props.defaultChecked ?? false,
    (next) => props.onCheckedChange?.(next),
  );

  const { Tag, classes, rest, children, theme } = RLSwitchTheme.setup(props, {
    as: "label",
    omit: [
      "defaultChecked",
      "onCheckedChange",
      "disabled",
      "name",
      "value",
      "label",
      "onChange",
    ] as const,
    variants: () => ({ checked: checked() }),
  });

  const handleChange = (event: Event & { currentTarget: HTMLInputElement }) => {
    setChecked(event.currentTarget.checked);
    props.onChange?.(event);
  };

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      <input
        type="checkbox"
        class={classes().input}
        data-slot="input"
        checked={checked()}
        disabled={props.disabled}
        name={props.name}
        value={props.value}
        onChange={handleChange}
      />
      <div class={classes().track} data-slot="track">
        <div class={classes().thumb} data-slot="thumb" />
      </div>
      <Show when={props.label ?? children()}>
        <span class={classes().label} data-slot="label">
          {props.label ?? children()}
        </span>
      </Show>
    </Tag>
  );
};
