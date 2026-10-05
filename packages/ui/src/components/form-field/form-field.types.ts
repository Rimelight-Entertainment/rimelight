import type { JSX } from "@solidjs/web";

export interface RLFormFieldProps {
  id?: string;
  /**
   * Label for the field.
   */
  label?: string;
  /**
   * Description text.
   */
  description?: string;
  /**
   * Error message.
   */
  error?: string;
  /**
   * Required field state.
   */
  required?: boolean;
  /**
   * Size scale.
   */
  size?: "sm" | "md" | "lg";
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  children?: JSX.Element;
  hint?: JSX.Element;
  labelSlot?: JSX.Element;
  descriptionSlot?: JSX.Element;
  errorSlot?: JSX.Element;
  helpSlot?: JSX.Element;
  [key: string]: unknown;
}
