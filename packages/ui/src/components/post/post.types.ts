import type { InferThemeProps } from "../../resolver";
import type { SlotRenderer, ThemeColor } from "../../types";
import type { RLPostTheme } from "./post.theme";

export type RLPostProps = InferThemeProps<typeof RLPostTheme> & {
  /**
   * The title of the post.
   *
   * @default undefined
   */
  title?: string | undefined;
  /**
   * The description of the post.
   *
   * @default undefined
   */
  description?: string | undefined;
  /**
   * The date of the post.
   *
   * @default undefined
   */
  date?: string | Date | null | undefined;
  /**
   * The image of the post, as a URL or an object with a `src`.
   *
   * @default undefined
   */
  image?: string | { src: string } | undefined;
  /**
   * The link to the post. When set, the root renders as an anchor.
   *
   * @default undefined
   */
  href?: string | undefined;
  /**
   * Localize an internal link for the current locale. Pass a locale code to target that
   * locale, or `false` to keep the href as-is.
   *
   * @default true
   */
  localize?: boolean | string | undefined;
  /**
   * Badge label displayed on the post.
   *
   * @default undefined
   */
  badge?: string | undefined;
  /**
   * Badge color scheme.
   *
   * @default "primary"
   */
  badgeColor?: ThemeColor | undefined;
  /**
   * Replaces the image block. Takes precedence over `image`.
   *
   * @default undefined
   */
  imageSlot?: SlotRenderer;
  /**
   * Replaces the title. Takes precedence over `title`.
   *
   * @default undefined
   */
  titleSlot?: SlotRenderer;
  /**
   * Replaces the description. Takes precedence over `description`.
   *
   * @default undefined
   */
  descriptionSlot?: SlotRenderer;
  /**
   * Replaces the badge. Takes precedence over `badge` and `badgeColor`.
   *
   * @default undefined
   */
  badgeSlot?: SlotRenderer;
  /**
   * Replaces the formatted date. Takes precedence over `date`.
   *
   * @default undefined
   */
  dateSlot?: SlotRenderer;
  /**
   * Content rendered in the footer below the post body.
   *
   * @default undefined
   */
  footerSlot?: SlotRenderer;
};
