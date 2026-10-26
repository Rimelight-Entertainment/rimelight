import type { JSX } from "@solidjs/web";
import type { Theme, ThemeColor } from "../../types";

export interface RLInputProps {
  /**
   * Type of input element.
   */
  type?:
    | "text"
    | "password"
    | "email"
    | "number"
    | "date"
    | "datetime-local"
    | "search"
    | "tel"
    | "url";
  /**
   * The input value.
   */
  value?: string | number;
  /**
   * Placeholder text.
   */
  placeholder?: string;
  /**
   * Disabled state.
   */
  disabled?: boolean;
  /**
   * Readonly state.
   */
  readonly?: boolean;
  /**
   * Name for forms.
   */
  name?: string;
  /**
   * Required field state.
   */
  required?: boolean;
  /**
   * Error state.
   */
  error?: boolean | string;
  /**
   * Leading icon name.
   */
  leadingIcon?: string;
  /**
   * Trailing icon name.
   */
  trailingIcon?: string;
  /**
   * Variant style.
   */
  variant?: "default" | "ghost";
  /**
   * Size scale.
   */
  size?: "sm" | "md" | "lg";
  /**
   * Color theme.
   */
  color?: ThemeColor;
  /**
   * Theme mode override — pins colors to flat, light, or dark mode.
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
  onInput?: (e: InputEvent & { currentTarget: HTMLInputElement }) => void;
  onChange?: (e: Event & { currentTarget: HTMLInputElement }) => void;
  onBlur?: (e: FocusEvent & { currentTarget: HTMLInputElement }) => void;
  onFocus?: (e: FocusEvent & { currentTarget: HTMLInputElement }) => void;
  onKeyDown?: (e: KeyboardEvent & { currentTarget: HTMLInputElement }) => void;
  ref?: HTMLInputElement | ((el: HTMLInputElement) => void);
  leading?: JSX.Element;
  trailing?: JSX.Element;
  [key: string]: unknown;
}
