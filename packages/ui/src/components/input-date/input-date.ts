import type { JSX } from "@solidjs/web";

export interface RLInputDateProps {
  value?: string;
  defaultValue?: string;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  min?: string;
  max?: string;
  step?: number;
  size?: "sm" | "md" | "lg";
  ui?: any;
  class?: any;
  children?: JSX.Element;
  onInput?: (e: InputEvent & { currentTarget: HTMLInputElement }) => void;
  onChange?: (e: Event & { currentTarget: HTMLInputElement }) => void;
  onBlur?: (e: FocusEvent & { currentTarget: HTMLInputElement }) => void;
  onFocus?: (e: FocusEvent & { currentTarget: HTMLInputElement }) => void;
  onKeyDown?: (e: KeyboardEvent & { currentTarget: HTMLInputElement }) => void;
}
