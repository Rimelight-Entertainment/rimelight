import type { JSX } from "@solidjs/web";

export interface RLInputPinProps {
  length?: number;
  value?: string;
  defaultValue?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  type?: "text" | "numeric" | "alphanumeric";
  size?: "sm" | "md" | "lg";
  ui?: any;
  class?: any;
  children?: JSX.Element;
  onInput?: (e: InputEvent & { currentTarget: HTMLInputElement }) => void;
  onChange?: (e: Event & { currentTarget: HTMLInputElement }) => void;
  onKeyDown?: (e: KeyboardEvent & { currentTarget: HTMLInputElement }) => void;
  onComplete?: (value: string) => void;
}
