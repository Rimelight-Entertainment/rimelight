import type { JSX } from "@solidjs/web";
import type { Theme, ThemeColor } from "../../types";

export interface RLChipProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any;

  /**
   * Display some text or numeric count inside the chip.
   */
  text?: string | number | undefined;

  /**
   * Color of the chip indicator.
   * @defaultValue 'primary'
   */
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

  /**
   * Size scale of the chip indicator.
   * @defaultValue 'md'
   */
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

  /**
   * The position of the chip relative to the wrapped component.
   * @defaultValue 'top-right'
   */
  position?: "top-right" | "bottom-right" | "top-left" | "bottom-left" | undefined;

  /**
   * When `true`, keep the chip inside the component for rounded elements (e.g. avatars).
   * @defaultValue false
   */
  inset?: boolean | undefined;

  /**
   * When `true`, render the chip relatively to the parent.
   * @defaultValue false
   */
  standalone?: boolean | undefined;

  /**
   * Controls the visibility of the chip indicator.
   * @defaultValue true
   */
  show?: boolean | undefined;

  /**
   * Theme mode override — pins colors to flat, light, or dark mode.
   */
  theme?: Theme;

  /**
   * Slot-specific CSS class overrides (`root` and `base`).
   */
  ui?: {
    root?: any;
    base?: any;
    [key: string]: any;
  };

  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;

  /**
   * Default content wrapped by the chip.
   */
  children?: JSX.Element;

  /**
   * Content / text rendered inside the chip indicator.
   */
  content?: JSX.Element;

  /**
   * Slot alias for `content`.
   */
  contentSlot?: JSX.Element;

  [key: string]: unknown;
}
