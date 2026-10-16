import type { RLFormFieldProps } from "./form-field.types";
import { RLFormFieldTheme } from "./form-field.theme";
import { createMemo, omit, type Component, Show } from "solid-js";

export const RLFormField: Component<RLFormFieldProps> = (props) => {
  const rest = omit(
    props,
    "id",
    "label",
    "description",
    "error",
    "required",
    "size",
    "ui",
    "class",
    "children",
    "hint",
    "labelSlot",
    "descriptionSlot",
    "errorSlot",
    "helpSlot",
  );

  const classes = createMemo(() =>
    RLFormFieldTheme({
      size: props.size ?? "md",
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      <Show when={props.label || props.labelSlot || props.hint}>
        <div class="flex items-center justify-between gap-2">
          <label for={props.id} class={classes().label} data-slot="label">
            {props.labelSlot ? props.labelSlot : props.label}
            <Show when={props.required}>
              <span class="text-error-500 ml-0.5">*</span>
            </Show>
          </label>
          <Show when={props.hint}>{props.hint}</Show>
        </div>
      </Show>

      <Show when={props.description || props.descriptionSlot}>
        <p class={classes().description} data-slot="description">
          {props.descriptionSlot ? props.descriptionSlot : props.description}
        </p>
      </Show>

      <div class="relative w-full">{props.children}</div>

      <Show when={props.error || props.errorSlot}>
        <p class={classes().error} data-slot="error">
          {props.errorSlot ? props.errorSlot : props.error}
        </p>
      </Show>

      <Show when={props.helpSlot}>
        <div class="mt-1">{props.helpSlot}</div>
      </Show>
    </div>
  );
};
