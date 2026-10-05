import type { RLCheckboxProps } from "./checkbox.types";
import { RLCheckboxTheme } from "./checkbox.theme";
import { createMemo, omit, children, type Component, Show } from "solid-js";
import { RLIcon } from "../icon/RLIcon";

export const RLCheckbox: Component<RLCheckboxProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
    "id",
    "checked",
    "disabled",
    "name",
    "label",
    "size",
    "color",
    "theme",
    "ui",
    "class",
    "onChange",
    "children",
  );

  const resolvedChildren = children(() => props.children);

  const resolvedClasses = createMemo(() =>
    RLCheckboxTheme({
      color: props.color ?? "primary",
      size: props.size ?? "md",
      theme: props.theme,
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <label class={resolvedClasses().root} data-slot="root" data-theme={props.theme}>
      <input
        id={props.id}
        type="checkbox"
        name={props.name}
        checked={!!props.checked}
        disabled={props.disabled}
        onChange={props.onChange}
        class={resolvedClasses().input}
        data-slot="input"
        {...rest}
      />
      <div class={resolvedClasses().box} data-slot="box">
        <span class={resolvedClasses().indicator} data-slot="indicator">
          <RLIcon name="check" size="xs" aria-hidden="true" />
        </span>
      </div>
      <Show when={props.label || resolvedChildren()}>
        <span class={resolvedClasses().label} data-slot="label">
          {resolvedChildren() !== undefined && resolvedChildren() !== null
            ? resolvedChildren()
            : props.label}
        </span>
      </Show>
    </label>
  );
};
