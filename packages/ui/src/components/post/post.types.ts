import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { ThemeColor } from "../../types";
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
  imageSlot?: JSX.Element;
  titleSlot?: JSX.Element;
  descriptionSlot?: JSX.Element;
  badgeSlot?: JSX.Element;
  dateSlot?: JSX.Element;
  footerSlot?: JSX.Element;
};
