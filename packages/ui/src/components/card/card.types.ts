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
   * Text or node displayed as the title of the card header.
   */
  title?: string | JSX.Element | undefined;

  /**
   * Text or node displayed as the description of the card header.
   */
  description?: string | JSX.Element | undefined;

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
  overlay?: JSX.Element;

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
   * Content rendered in the header slot. Replaces title and description.
   */
  header?: JSX.Element;

  /**
   * Slot alias for `header`.
   */
  headerSlot?: JSX.Element;

  /**
   * Custom title slot content.
   */
  titleSlot?: JSX.Element;

  /**
   * Custom description slot content.
   */
  descriptionSlot?: JSX.Element;

  /**
   * Content rendered in the body slot.
   */
  body?: JSX.Element;

  /**
   * Slot alias for `body`.
   */
  bodySlot?: JSX.Element;

  /**
   * Content rendered in the footer slot.
   */
  footer?: JSX.Element;

  /**
   * Slot alias for `footer`.
   */
  footerSlot?: JSX.Element;

  /**
   * Custom media content slot.
   */
  media?: JSX.Element;

  /**
   * Slot alias for `media`.
   */
  mediaSlot?: JSX.Element;

  /**
   * Custom overlay content slot.
   */
  overlaySlot?: JSX.Element;

  [key: string]: unknown;
}
