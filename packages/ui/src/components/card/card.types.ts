import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { RLCardTheme } from "./card.theme";

/**
 * Card props. `@status stable`.
 */
export type RLCardProps = InferThemeProps<typeof RLCardTheme> & {
  /**
   * Title text of the card header. Use `titleSlot` for JSX.
   * @default undefined; the title is omitted when unset.
   */
  title?: string | undefined;

  /**
   * Description text of the card header. Use `descriptionSlot` for JSX.
   * @default undefined; the description is omitted when unset.
   */
  description?: string | undefined;

  /**
   * Image URL for the media area. Use `mediaSlot` for custom media.
   * @default undefined; no media is rendered when unset.
   */
  mediaSrc?: string | undefined;

  /**
   * Target URL. When set, the card renders as an `a` element.
   * @default undefined; the card renders as a `div`.
   */
  href?: string | undefined;

  /**
   * Where to open the linked URL. Only applies when `href` is set.
   * @default undefined; the browser default applies.
   */
  target?: string | undefined;

  /**
   * Relationship of the linked URL. Only applies when `href` is set.
   * @default "noopener noreferrer" when `target` is `"_blank"`, otherwise undefined.
   */
  rel?: string | undefined;

  /**
   * ARIA role of the root element.
   * @default undefined
   */
  role?: JSX.HTMLAttributes<HTMLElement>["role"];

  /**
   * Accessible name of the root element.
   * @default undefined
   */
  "aria-label"?: string | undefined;

  /**
   * Id of the element that labels the root element.
   * @default the title id when a title is rendered, otherwise undefined.
   */
  "aria-labelledby"?: string | undefined;

  /**
   * Id of the element that describes the root element.
   * @default the description id when a description is rendered, otherwise undefined.
   */
  "aria-describedby"?: string | undefined;

  /**
   * Header content. Replaces `title`, `titleSlot`, `description` and `descriptionSlot`.
   * @default undefined
   */
  headerSlot?: JSX.Element;

  /**
   * Custom title content. Takes precedence over `title`.
   * @default undefined
   */
  titleSlot?: JSX.Element;

  /**
   * Custom description content. Takes precedence over `description`.
   * @default undefined
   */
  descriptionSlot?: JSX.Element;

  /**
   * Body content. Takes precedence over `children`.
   * @default undefined
   */
  bodySlot?: JSX.Element;

  /**
   * Footer content.
   * @default undefined
   */
  footerSlot?: JSX.Element;

  /**
   * Media content. Takes precedence over `mediaSrc`.
   * @default undefined
   */
  mediaSlot?: JSX.Element;

  /**
   * Overlay content. Rendered in place of the header, body and footer.
   * @default undefined
   */
  overlaySlot?: JSX.Element;
};
