import type { JSX } from "@solidjs/web";

export interface RLPostProps {
  /**
   * The title of the post.
   */
  title?: string;
  /**
   * The description of the post.
   */
  description?: string;
  /**
   * The date of the post.
   */
  date?: string | Date;
  /**
   * The image of the post.
   */
  image?: string | Record<string, any>;
  /**
   * The link to the post.
   */
  to?: string;
  /**
   * The variant of the post.
   */
  variant?: "soft" | "ghost";
  /**
   * The orientation layout of the post.
   */
  orientation?: "vertical" | "horizontal";
  /**
   * Badge label displayed on the post.
   */
  badge?: string;
  /**
   * Badge color scheme.
   */
  badgeColor?: string;
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
