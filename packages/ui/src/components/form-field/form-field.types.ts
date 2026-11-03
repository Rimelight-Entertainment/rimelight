import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
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
   */
  labelSlot?: JSX.Element;
  /**
   * Replaces the description text.
   */
  descriptionSlot?: JSX.Element;
  /**
   * Replaces the error message.
   */
  errorSlot?: JSX.Element;
  /**
   * Content shown below the error message.
   */
  helpSlot?: JSX.Element;
  /**
   * Content shown at the right of the label row.
   */
  hintSlot?: JSX.Element;
};
