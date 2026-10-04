import type { ThemeColor } from "../../types";

export interface RLTextareaProps {
  autoGrow?: boolean;
  /**
   * The text value.
   */
  value?: string;
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
   * Row count.
   */
  rows?: number;
  /**
   * Error state.
   */
  error?: boolean | string;
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
  onInput?: (e: InputEvent & { currentTarget: HTMLTextAreaElement }) => void;
  onChange?: (e: Event & { currentTarget: HTMLTextAreaElement }) => void;
  onBlur?: (e: FocusEvent & { currentTarget: HTMLTextAreaElement }) => void;
  onFocus?: (e: FocusEvent & { currentTarget: HTMLTextAreaElement }) => void;
  onKeyDown?: (e: KeyboardEvent & { currentTarget: HTMLTextAreaElement }) => void;
  ref?: HTMLTextAreaElement | ((el: HTMLTextAreaElement) => void);
  [key: string]: unknown;
}
