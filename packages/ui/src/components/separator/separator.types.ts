import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { RLAvatarProps } from "../avatar/avatar.types";
import type { RLSeparatorTheme } from "./separator.theme";

/**
 * Visual divider, optionally carrying a label, icon, or avatar.
 */
export type RLSeparatorProps = InferThemeProps<typeof RLSeparatorTheme> & {
  /**
   * Whether to treat as purely decorative (hides from accessibility tree).
   * @default true
   */
  decorative?: boolean | undefined;

  /**
   * Text rendered in the middle of the separator.
   * @default undefined
   */
  label?: string | undefined;

  /**
   * Icon name rendered in the middle of the separator.
   * @default undefined
   */
  icon?: string | undefined;

  /**
   * Avatar props, or an image URL, rendered in the middle of the separator.
   * @default undefined
   */
  avatar?: RLAvatarProps | string | undefined;

  /**
   * Replaces the avatar with custom JSX.
   * @default undefined
   */
  avatarSlot?: JSX.Element;

  /**
   * Replaces the icon with custom JSX.
   * @default undefined
   */
  iconSlot?: JSX.Element;
};
