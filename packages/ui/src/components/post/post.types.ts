import type { JSX } from "@solidjs/web";

export interface RLPostProps {
  /**
   * The title of the post.
   */
  title?: string | undefined;
  /**
   * The description of the post.
   */
  description?: string | undefined;
  /**
   * The date of the post.
   */
  date?: string | Date | undefined;
  /**
   * The image of the post.
   */
  image?: string | Record<string, any> | undefined;
  /**
   * The link to the post.
   */
  href?: string | undefined;
  /**
   * The link to the post (alias of href).
   */
  to?: string | undefined;
  /**
   * Localize an internal link for the current locale. Pass a locale code to target that
   * locale, or `false` to keep the href as-is.
   *
   * @default true
   */
  localize?: boolean | string | undefined;
  /**
   * The variant of the post.
   */
  variant?: "soft" | "ghost" | undefined;
  /**
   * The orientation layout of the post.
   */
  orientation?: "vertical" | "horizontal" | undefined;
  /**
   * Badge label displayed on the post.
   */
  badge?: string | undefined;
  /**
   * Badge color scheme.
   */
  badgeColor?: string | undefined;
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  children?: JSX.Element;
  imageSlot?: JSX.Element;
  titleSlot?: JSX.Element;
  descriptionSlot?: JSX.Element;
  badgeSlot?: JSX.Element;
  dateSlot?: JSX.Element;
  footerSlot?: JSX.Element;
  [key: string]: unknown;
}
