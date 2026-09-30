import type { ThemeColor } from "../../types";
export interface InputMenuProps {
  /**
   * The list of items in the input menu.
   */
  items?: Array<{ label: string; value: string; [key: string]: any } | string>;
  /**
   * Selected value(s).
   */
  value?: string | string[];
  /**
   * Placeholder text.
   */
  placeholder?: string;
  /**
   * Disabled state.
   */
  disabled?: boolean;
  /**
   * Form control name.
   */
  name?: string;
  /**
   * Form label.
   */
  label?: string;
  /**
   * Size scale.
   */
  size?: "sm" | "md" | "lg";
  /**
   * Color theme.
   */
  color?: ThemeColor;
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  [key: string]: unknown;
}
