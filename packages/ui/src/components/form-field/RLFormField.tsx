import type { Component } from "solid-js";
import { Show } from "solid-js";
import type { RLFormFieldProps } from "./form-field.types";
import { RLFormFieldTheme } from "./form-field.theme";

const OMIT_KEYS = ["id", "label", "description", "error", "required", "hint"] as const;

export const RLFormField: Component<RLFormFieldProps> = (props) => {
  const { classes, rest, slots } = RLFormFieldTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: ["labelSlot", "descriptionSlot", "errorSlot", "helpSlot", "hintSlot"] as const,
  });

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      <Show when={props.label || slots.labelSlot() || slots.hintSlot()}>
        <div class="flex items-center justify-between gap-2">
          <label for={props.id} class={classes().label} data-slot="label">
            {slots.labelSlot() ? slots.labelSlot() : props.label}
            <Show when={props.required}>
              <span class="text-error-500 ml-0.5">*</span>
            </Show>
          </label>
          <Show when={slots.hintSlot()}>{slots.hintSlot()}</Show>
        </div>
      </Show>

      <Show when={props.description || slots.descriptionSlot()}>
        <p class={classes().description} data-slot="description">
          {slots.descriptionSlot() ? slots.descriptionSlot() : props.description}
        </p>
      </Show>

      <div class="relative w-full">{props.children}</div>

      <Show when={props.error || slots.errorSlot()}>
        <p class={classes().error} data-slot="error">
          {slots.errorSlot() ? slots.errorSlot() : props.error}
        </p>
      </Show>

      <Show when={slots.helpSlot()}>
        <div class="mt-1">{slots.helpSlot()}</div>
      </Show>
    </div>
  );
};
