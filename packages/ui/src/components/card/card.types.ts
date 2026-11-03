import type { ValidComponent } from "@solidjs/web";
import type { JSX } from "@solidjs/web";

export type CardVariant = "solid" | "outline" | "soft" | "subtle";

export interface RLCardProps {
  /**
   * The element or component this component should render as.
   *
   * @default "div"
   */
  as?: ValidComponent;

  /**
   * Title text of the card header. Use titleSlot for JSX.
   */
  title?: string | undefined;

  /**
   * Description text of the card header. Use descriptionSlot for JSX.
   */
  description?: string | undefined;

  /**
   * The visual variant of the card.
   *
   * @default "outline"
   */
  variant?: CardVariant | undefined;

  /**
   * The image URL for the media slot.
   */
  mediaSrc?: string | undefined;

  /**
   * Whether to render content in an overlay layer over media.
   *
   * @default false
   */
  overlay?: boolean | undefined;

  /**
   * Target URL when card acts as a link.
   */
  href?: string | undefined;

  /**
   * Where to open the linked URL when card is a link.
   */
  target?: string | undefined;

  /**
   * Relationship of the linked URL when card is a link.
   */
  rel?: string | undefined;

  /**
   * Unique ID for the card root element.
   */
  id?: string | undefined;

  /**
   * Explicit WAI-ARIA role for the card.
   */
  role?: string | undefined;

  /**
   * Screen reader accessibility label.
   */
  ariaLabel?: string | undefined;

  /**
   * Identifies the element(s) that label the card.
   */
  ariaLabelledby?: string | undefined;

  /**
   * Identifies the element(s) that describe the card.
   */
  ariaDescribedby?: string | undefined;

  /**
   * Force a theme mode context on the component.
   */
  theme?: string | undefined;

  /**
   * Slot-specific CSS class overrides.
   */
  ui?:
    | {
        root?: string;
        header?: string;
        title?: string;
        description?: string;
        body?: string;
        footer?: string;
        overlay?: string;
        media?: string;
        [key: string]: any;
      }
    | undefined;

  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;

  /**
   * Default slot content rendered in the card body.
   */
  children?: JSX.Element;

  /**
   * Header content. Replaces title and description.
   */
  headerSlot?: JSX.Element;

  /**
   * Custom title content. Takes precedence over the `title` string.
   */
  titleSlot?: JSX.Element;

  /**
   * Custom description content. Takes precedence over the `description` string.
   */
  descriptionSlot?: JSX.Element;

  /**
   * Body content. Takes precedence over `children`.
   */
  bodySlot?: JSX.Element;

  /**
   * Footer content.
   */
  footerSlot?: JSX.Element;

  /**
   * Media content. Takes precedence over `mediaSrc`.
   */
  mediaSlot?: JSX.Element;

  /**
   * Custom overlay content slot.
   */
  overlaySlot?: JSX.Element;

  [key: string]: unknown;
}
