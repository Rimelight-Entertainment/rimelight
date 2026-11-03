import type { JSX } from "@solidjs/web";
import type { ThemeColor } from "../../types";
import type { RLButtonProps } from "../button/button.types";

export interface SelectItem {
  label?: string;
  value?: string | number;
  disabled?: boolean;
  icon?: string;
  avatar?: string;
  [key: string]: unknown;
}

export interface RLSelectProps {
  id?: string | undefined;
  name?: string | undefined;
  value?: string | number | (string | number)[] | undefined;
  defaultValue?: string | number | (string | number)[] | undefined;
  placeholder?: string | undefined;
  disabled?: boolean | undefined;
  required?: boolean | undefined;
  multiple?: boolean | undefined;
  color?: ThemeColor | undefined;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | undefined;
  variant?: "default" | "icon" | "outline" | "soft" | "subtle" | "ghost" | "none" | undefined;
  buttonVariant?: RLButtonProps["variant"] | undefined;
  buttonColor?: RLButtonProps["color"] | undefined;
  class?: string | undefined;
  items?: SelectItem[] | string[] | undefined;
  leadingIcon?: string | undefined;
  leadingSlot?: JSX.Element | undefined;
  children?: JSX.Element | undefined;
  theme?: string | undefined;
  ui?: any;
  onChange?: (e: Event & { currentTarget: HTMLSelectElement }) => void;
  onBlur?: (e: FocusEvent & { currentTarget: HTMLSelectElement }) => void;
  [key: string]: unknown;
}
