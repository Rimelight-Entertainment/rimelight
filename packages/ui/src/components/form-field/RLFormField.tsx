import { createMemo, omit, children, type Component, Show } from "solid-js";
import type { RLFormFieldProps } from "./form-field";
import { formFieldTheme } from "./form-field.theme";

export const RLFormField: Component<RLFormFieldProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
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

  const resolvedClasses = createMemo(() =>
    formFieldTheme({
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
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      <Show when={props.label || resolvedLabelSlot() || resolvedHint()}>
        <div class="flex items-center justify-between gap-2">
          <label for={props.id} class={resolvedClasses().label} data-slot="label">
            {resolvedLabelSlot() ? resolvedLabelSlot() : props.label}
            <Show when={props.required}>
              <span class="text-error-500 ml-0.5">*</span>
            </Show>
          </label>
          <Show when={resolvedHint()}>{resolvedHint()}</Show>
        </div>
      </Show>

      <Show when={props.description || resolvedDescriptionSlot()}>
        <p class={resolvedClasses().description} data-slot="description">
          {resolvedDescriptionSlot() ? resolvedDescriptionSlot() : props.description}
        </p>
      </Show>

      <div class="relative w-full">{props.children}</div>

      <Show when={props.error || resolvedErrorSlot()}>
        <p class={resolvedClasses().error} data-slot="error">
          {resolvedErrorSlot() ? resolvedErrorSlot() : props.error}
        </p>
      </Show>

      <Show when={resolvedHelpSlot()}>
        <div class="mt-1">{resolvedHelpSlot()}</div>
      </Show>
    </div>
  );
};
