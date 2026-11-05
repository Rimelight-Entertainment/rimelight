import type { RLRadioGroupProps } from "./radio-group.types";
import { RLRadioGroupTheme } from "./radio-group.theme";
import { For, Show, type Component } from "solid-js";
import { createControllable } from "../../controllable";
import { RLLabel } from "../label/RLLabel";

export const RLRadioGroup: Component<RLRadioGroupProps> = (props) => {
  const [value, setValue] = createControllable<string | null>(
    () => props.value,
    props.defaultValue ?? null,
    (next) => props.onValueChange?.(next),
  );

  const { Tag, classes, rest, theme, id } = RLRadioGroupTheme.setup(props, {
    idPrefix: "rl-radio-group",
    omit: [
      "items",
      "value",
      "defaultValue",
      "onValueChange",
      "disabled",
      "name",
      "aria-label",
      "aria-labelledby",
      "aria-describedby",
    ] as const,
  });

  const groupName = () => props.name ?? id();

  return (
    <Tag
      role="radiogroup"
      data-slot="root"
      data-theme={theme()}
      data-orientation={props.orientation ?? "vertical"}
      data-disabled={props.disabled ? "" : undefined}
      aria-label={props["aria-label"]}
      aria-labelledby={props["aria-labelledby"]}
      aria-describedby={props["aria-describedby"]}
      class={classes().root}
      {...rest}
    >
      <For each={props.items ?? []}>
        {(item) => {
          const checked = () => value() === item.value;
          return (
            <RLLabel
              class={classes().item}
              data-slot="item"
              data-state={checked() ? "checked" : "unchecked"}
              data-disabled={props.disabled || item.disabled ? "" : undefined}
            >
              <input
                type="radio"
                name={groupName()}
                value={item.value}
                checked={checked()}
                disabled={props.disabled || item.disabled}
                class={classes().input}
                data-slot="input"
                onChange={() => setValue(item.value)}
              />
              <span class={classes().control} data-slot="control">
                <span class={classes().indicator} data-slot="indicator" />
              </span>
              <Show when={item.label || item.description}>
                <span class={classes().body} data-slot="body">
                  <Show when={item.label}>
                    <span class={classes().label} data-slot="label">
                      {item.label}
                    </span>
                  </Show>
                  <Show when={item.description}>
                    <span class={classes().description} data-slot="description">
                      {item.description}
                    </span>
                  </Show>
                </span>
              </Show>
            </RLLabel>
          );
        }}
      </For>
    </Tag>
  );
};
