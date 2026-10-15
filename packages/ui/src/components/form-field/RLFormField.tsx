import type { RLFormFieldProps } from "./form-field.types";
import { RLFormFieldTheme } from "./form-field.theme";
import { createMemo, omit, children, type Component, Show } from "solid-js";

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

  const resolvedHint = children(() => props.hint);
  const resolvedLabelSlot = children(() => props.labelSlot);
  const resolvedDescriptionSlot = children(() => props.descriptionSlot);
  const resolvedErrorSlot = children(() => props.errorSlot);
  const resolvedHelpSlot = children(() => props.helpSlot);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      <Show when={props.label || resolvedLabelSlot() || resolvedHint()}>
        <div class="flex items-center justify-between gap-2">
          <label for={props.id} class={classes().label} data-slot="label">
            {resolvedLabelSlot() ? resolvedLabelSlot() : props.label}
            <Show when={props.required}>
              <span class="text-error-500 ml-0.5">*</span>
            </Show>
          </label>
          <Show when={resolvedHint()}>{resolvedHint()}</Show>
        </div>
      </Show>

      <Show when={props.description || resolvedDescriptionSlot()}>
        <p class={classes().description} data-slot="description">
          {resolvedDescriptionSlot() ? resolvedDescriptionSlot() : props.description}
        </p>
      </Show>

      <div class="relative w-full">{props.children}</div>

      <Show when={props.error || resolvedErrorSlot()}>
        <p class={classes().error} data-slot="error">
          {resolvedErrorSlot() ? resolvedErrorSlot() : props.error}
        </p>
      </Show>

      <Show when={resolvedHelpSlot()}>
        <div class="mt-1">{resolvedHelpSlot()}</div>
      </Show>
    </div>
  );
};
