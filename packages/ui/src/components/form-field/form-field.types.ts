import type { InferThemeProps } from "../../resolver";
import type { SlotRenderer } from "../../types";
import type { RLFormFieldTheme } from "./form-field.theme";

export type RLFormFieldProps = InferThemeProps<typeof RLFormFieldTheme> & {
  /**
   * Id of the wrapped control; the label's `for` points at it.
   * @default generated
   */
  id?: string | undefined;
  /**
   * Label text. Ignored when `labelSlot` is set.
   * @default undefined
   */
  label?: string | undefined;
  /**
   * Helper text under the label. Ignored when `descriptionSlot` is set.
   * @default undefined
   */
  description?: string | undefined;
  /**
   * Error message under the control. Ignored when `errorSlot` is set.
   * @default undefined
   */
  error?: string | undefined;
  /**
   * Shows a required asterisk next to the label.
   * @default false
   */
  required?: boolean | undefined;
  /**
   * Replaces the label text.
   * @default undefined
   */
  labelSlot?: SlotRenderer;
  /**
   * Replaces the description text.
   * @default undefined
   */
  descriptionSlot?: SlotRenderer;
  /**
   * Replaces the error message.
   * @default undefined
   */
  errorSlot?: SlotRenderer;
  /**
   * Contextual content below the control and error message. Rendered in the `help` slot.
   * @default undefined
   */
  helpSlot?: SlotRenderer;
  /**
   * Inline annotation at the right of the label row. Rendered in the `hint` slot.
   * @default undefined
   */
  hintSlot?: SlotRenderer;
};
