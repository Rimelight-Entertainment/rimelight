import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { RLBadgeTheme } from "./badge.theme";
import type { RLAvatarProps } from "../avatar/avatar.types";

/**
 * Small status or label chip. Renders a `<span>` with optional icon, avatar and slots.
 */
export type RLBadgeProps = InferThemeProps<typeof RLBadgeTheme> & {
  /**
   * Text label to display. Alternative to passing children.
   * @default undefined
   */
  label?: string | number | undefined;

  /**
   * Icon name shown on the side selected by `leading` / `trailing`.
   * @default undefined
   */
  icon?: string | undefined;

  /**
   * When `true`, `icon` is displayed on the left side.
   * @default false
   */
  leading?: boolean | undefined;

  /**
   * When `true`, `icon` is displayed on the right side.
   * @default false
   */
  trailing?: boolean | undefined;

  /**
   * Icon name displayed on the left side. Takes precedence over `icon`.
   * @default undefined
   */
  leadingIcon?: string | undefined;

  /**
   * Icon name displayed on the right side. Takes precedence over `icon`.
   * @default undefined
   */
  trailingIcon?: string | undefined;

  /**
   * Avatar displayed on the left side. A string is used as the image source.
   * @default undefined
   */
  avatar?: RLAvatarProps | string | undefined;

  /**
   * Custom JSX rendered on the left side. Replaces the leading icon and avatar.
   * @default undefined
   */
  leadingSlot?: JSX.Element;

  /**
   * Custom JSX rendered on the right side. Replaces the trailing icon.
   * @default undefined
   */
  trailingSlot?: JSX.Element;
};
