import type { JSX } from "@solidjs/web";
import type { Theme } from "../../types";

export interface RLLinkProps {
  /**
   * The text label displayed inside the link. Alternative to passing children via the default slot.
   */
  label?: string | undefined;
  /**
   * Icon name displayed before the link label.
   */
  leadingIcon?: string | undefined;
  /**
   * Icon name displayed after the link label. Replaces the external icon when set.
   */
  trailingIcon?: string | undefined;
  /**
   * The URL the link points to.
   */
  href?: string | undefined;
  /**
   * Alias for `href`.
   */
  to?: string | undefined;
  /**
   * Forces the link to be treated as an external link.
   *
   * @default false
   */
  external?: boolean | undefined;
  /**
   * Custom external link icon name.
   *
   * @default "external-link"
   */
  externalIcon?: string | undefined;
  /**
   * Suppress the automatic external link icon.
   *
   * @default false
   */
  noExternalIcon?: boolean | undefined;
  /**
   * Where to open the linked URL. External links default to `"_blank"`.
   *
   * @default undefined
   */
  target?: string | undefined;
  /**
   * Relationship of the linked URL. External links default to `"noopener noreferrer"`. Set to empty
   * string to suppress the attribute entirely.
   *
   * @default undefined
   */
  rel?: string | null | undefined;
  /**
   * Applies active styling to the link.
   *
   * @default undefined
   */
  active?: boolean | undefined;
  /**
   * Disables the link, preventing navigation and applying disabled styling.
   *
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * When true, only `class` is applied — all default theme styles are skipped.
   *
   * @default false
   */
  raw?: boolean | undefined;
  /**
   * Screen reader accessibility label. When omitted on external links, "(opens in a new tab)" is
   * appended automatically.
   */
  ariaLabel?: string | undefined;
  /**
   * The value of `aria-current` when the link is the active/current page.
   *
   * @default "page"
   */
  ariaCurrentValue?:
    | "page"
    | "step"
    | "location"
    | "date"
    | "time"
    | "true"
    | "false"
    | boolean
    | undefined;
  /**
   * Force a color-scheme context on the component.
   */
  theme?: Theme | undefined;
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  children?: JSX.Element;
  leading?: JSX.Element;
  trailing?: JSX.Element;
  [key: string]: unknown;
}
