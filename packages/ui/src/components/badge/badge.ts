import type { JSX } from "@solidjs/web";
import type { Theme, ThemeColor } from "../../types";
import type { RLAvatarProps } from "../avatar/avatar";

export interface RLBadgeProps {
  /**
   * The element or component this component should render as.
   *
   * @default "span"
   */
  as?: any;
  /**
   * Text label to display.
   */
  label?: string | number | undefined;
  /**
   * Color scheme applied.
   *
   * @default "primary"
   */
  color?:
    | ThemeColor
    | "error"
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "neutral"
    | undefined;
  /**
   * Visual style variant.
   *
   * @default "solid"
   */
  variant?: "solid" | "outline" | "soft" | "subtle" | "ghost" | undefined;
  /**
   * The size scale of the badge.
   *
   * @default "md"
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | undefined;
  /**
   * The shape corner rounding.
   */
  shape?: "square" | "rounded" | "pill" | undefined;
  /**
   * Render the badge with equal padding on all sides.
   */
  square?: boolean | undefined;
  /**
   * Field group orientation styling when placed inside a field group.
   */
  fieldGroup?: "horizontal" | "vertical" | undefined;
  /**
   * Display an icon based on the `leading` and `trailing` props.
   */
  icon?: any;
  /**
   * Display an avatar on the left side.
   */
  avatar?: RLAvatarProps | string | undefined;
  /**
   * When `true`, the icon will be displayed on the left side.
   */
  leading?: boolean | undefined;
  /**
   * Display an icon on the left side.
   */
  leadingIcon?: any;
  /**
   * When `true`, the icon will be displayed on the right side.
   */
  trailing?: boolean | undefined;
  /**
   * Display an icon on the right side.
   */
  trailingIcon?: any;
  /**
   * Theme mode override — pins colors to flat, light, or dark mode.
   */
  theme?: Theme | undefined;
  /**
   * Slot-specific CSS class overrides.
   */
  ui?:
    | {
        root?: any;
        base?: any;
        label?: any;
        leadingIcon?: any;
        leadingAvatar?: any;
        leadingAvatarSize?: any;
        trailingIcon?: any;
        [key: string]: any;
      }
    | undefined;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  /**
   * Default slot children.
   */
  children?: JSX.Element;
  /**
   * Replaces the leading icon.
   */
  leadingSlot?: JSX.Element;
  /**
   * Replaces the trailing icon.
   */
  trailingSlot?: JSX.Element;
  [key: string]: unknown;
}
