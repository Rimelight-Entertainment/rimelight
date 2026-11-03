import type { InferThemeProps } from "../../resolver";
import type { RLAvatarProps } from "../avatar/avatar.types";
import type { RLAvatarGroupTheme } from "./avatar-group.theme";

/**
 * Data for one avatar rendered by `items`. Forwarded to `RLAvatar`.
 */
export type AvatarItemData = Pick<
  RLAvatarProps,
  "src" | "alt" | "icon" | "text" | "color" | "chip" | "loading"
>;

export type RLAvatarGroupProps = InferThemeProps<typeof RLAvatarGroupTheme> & {
  /**
   * Avatars to render from data. When omitted, the `children` are rendered instead.
   */
  items?: AvatarItemData[];
  /**
   * Maximum number of avatars to display. The remainder is shown as a `+X` counter.
   * When omitted, every avatar is displayed.
   */
  max?: number;
};
