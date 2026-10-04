import type { JSX } from "@solidjs/web";
import type { Theme, ThemeColor } from "../../types";

export interface RLChipProps {
  color?:
    | "error"
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "neutral"
    | ThemeColor
    | (string & {})
    | undefined;
  size?:
    | "3xs"
    | "2xs"
    | "xs"
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | (string & {})
    | undefined;
  position?: "top-right" | "bottom-right" | "top-left" | "bottom-left" | undefined;
  inset?: boolean | undefined;
  text?: any;
  standalone?: boolean | undefined;
  show?: boolean | undefined;
  activeColor?: string;
  activeVariant?: string;
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
  children?: JSX.Element;
  content?: JSX.Element;
  [key: string]: unknown;
}
