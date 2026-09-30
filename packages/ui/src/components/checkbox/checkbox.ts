import type { Theme, ThemeColor } from "../../types";

export interface CheckboxProps {
  /**
   * Controlled checked state.
   */
  checked?: boolean;
  /**
   * Disabled input interaction state.
   */
  disabled?: boolean;
  /**
   * Input name for forms.
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
   * Theme mode override â€” pins colors to flat, light, or dark mode.
   */
  theme?: Theme;
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
