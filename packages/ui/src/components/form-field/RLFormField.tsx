import type { Component } from "solid-js";
import { Show } from "solid-js";
import type { RLFormFieldProps } from "./form-field.types";
import { RLFormFieldTheme } from "./form-field.theme";
import { RLLabel } from "../label/RLLabel";
import { renderSlot } from "../../slot";

export const RLFormField: Component<RLFormFieldProps> = (props) => {
  const { Tag, classes, rest, children, id, slots, theme } = RLFormFieldTheme.setup(props, {
    omit: ["id", "label", "description", "error", "required"] as const,
    slots: ["labelSlot", "descriptionSlot", "errorSlot", "helpSlot", "hintSlot"] as const,
  });

  const hasLabelSlot = () => Boolean(slots.labelSlot());
  const hasDescriptionSlot = () => Boolean(slots.descriptionSlot());
  const hasErrorSlot = () => Boolean(slots.errorSlot());
  const hasHelpSlot = () => Boolean(slots.helpSlot());
  const hasHintSlot = () => Boolean(slots.hintSlot());
  const hasLabel = () => Boolean(props.label) || hasLabelSlot();
  const hasDescription = () => Boolean(props.description) || hasDescriptionSlot();
  const hasError = () => Boolean(props.error) || hasErrorSlot();
  const hasHeader = () => hasLabel() || hasHintSlot();

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      <Show when={hasHeader()}>
        <div class={classes().header} data-slot="header">
          <RLLabel for={id()} class={classes().label} data-slot="label">
            <Show when={hasLabelSlot()} fallback={props.label}>
              {renderSlot(slots.labelSlot())}
            </Show>
            <Show when={props.required}>
              <span class={classes().required} data-slot="required">
                *
              </span>
            </Show>
          </RLLabel>
          <Show when={hasHintSlot()}>
            <span class={classes().hint} data-slot="hint">
              {renderSlot(slots.hintSlot())}
            </span>
          </Show>
        </div>
      </Show>

      <Show when={hasDescription()}>
        <p class={classes().description} data-slot="description">
          <Show when={hasDescriptionSlot()} fallback={props.description}>
            {renderSlot(slots.descriptionSlot())}
          </Show>
        </p>
      </Show>

      <div class={classes().control} data-slot="control">
        {children()}
      </div>

      <Show when={hasError()}>
        <p class={classes().error} data-slot="error">
          <Show when={hasErrorSlot()} fallback={props.error}>
            {renderSlot(slots.errorSlot())}
          </Show>
        </p>
      </Show>

      <Show when={hasHelpSlot()}>
        <div class={classes().help} data-slot="help">
          {renderSlot(slots.helpSlot())}
        </div>
      </Show>
    </Tag>
  );
};
