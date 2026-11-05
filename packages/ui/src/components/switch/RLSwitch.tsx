import { createMemo, Show, type Component } from "solid-js";
import type { RLSwitchProps } from "./switch.types";
import { RLSwitchTheme } from "./switch.theme";
import { createControllable } from "../../controllable";

export const RLSwitch: Component<RLSwitchProps> = (props) => {
  const [checked, setChecked] = createControllable<boolean>(
    () => props.checked,
    props.defaultChecked ?? false,
    (next) => props.onValueChange?.(next),
  );

  const { Tag, classes, rest, children, theme } = RLSwitchTheme.setup(props, {
    as: "label",
    omit: [
      "defaultChecked",
      "onValueChange",
      "disabled",
      "name",
      "value",
      "label",
      "onChange",
      "aria-label",
      "aria-labelledby",
      "aria-describedby",
    ] as const,
    variants: () => ({ checked: checked() }),
  });

  const hasLabel = createMemo(() => Boolean(props.label || children()));

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
        aria-label={props["aria-label"]}
        aria-labelledby={props["aria-labelledby"]}
        aria-describedby={props["aria-describedby"]}
        onChange={handleChange}
      />
      <div class={classes().track} data-slot="track">
        <div class={classes().thumb} data-slot="thumb" />
      </div>
      <Show when={hasLabel()}>
        <span class={classes().label} data-slot="label">
          <Show when={props.label} fallback={children()}>
            {props.label}
          </Show>
        </span>
      </Show>
    </Tag>
  );
};
