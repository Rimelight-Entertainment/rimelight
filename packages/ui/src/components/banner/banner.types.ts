import type { JSX } from "@solidjs/web";
import type { ThemeColor } from "../../types";
import type { RLButtonProps } from "../button/button.types";

export interface RLBannerProps {
  /**
   * The element or component this component should render as.
   *
   * @default "div"
   */
  as?: any;

  /**
   * A unique id saved to local storage to remember if the banner has been dismissed. Without an
   * explicit id, the banner will not be persisted and will reappear on page reload.
   */
  id?: string | undefined;

  /**
   * The icon displayed next to the title.
   */
  icon?: string | undefined;

  /**
   * The URL the banner links to (alias for href).
   */
  to?: string | undefined;

  /**
   * Text or node title of the banner.
   */
  title?: string | JSX.Element | undefined;

  /**
   * Display a list of actions next to the title.
   */
  actions?: RLButtonProps[] | undefined;

  /**
   * Color variant of the banner.
   *
   * @default "primary"
   */
  color?: ThemeColor | undefined;

  /**
   * Display a close button to dismiss the banner. Can be boolean or button props override.
   *
   * @default false
   */
  close?: boolean | RLButtonProps | undefined;

  /**
   * The icon displayed in the close button.
   *
   * @default "x"
   */
  closeIcon?: string | undefined;

  /**
   * Custom callback invoked when the banner is closed.
   */
  onClose?: () => void;

  /**
   * Whether to contain the banner content within a max-width container.
   *
   * @default true
   */
  contain?: boolean | undefined;

  /**
   * Whether the banner should be sticky at the top of the viewport.
   *
   * @default false
   */
  sticky?: boolean | undefined;

  /**
   * Whether the banner should be fixed at the top of the viewport.
   *
   * @default false
   */
  fixed?: boolean | undefined;

  /**
   * The z-index stack position in Rimelight header stack logic.
   *
   * @default 0
   */
  stackIndex?: number | undefined;

  /**
   * Whether to hide the banner when scrolling down and show it when scrolling up.
   *
   * @default false
   */
  hideOnScroll?: boolean | undefined;

  /**
   * Alias for dismissable in Rimelight UI.
   *
   * @deprecated use `close` prop instead
   */
  dismissable?: boolean | undefined;

  /**
   * Alias for id / persistence storage key.
   *
   * @deprecated use `id` prop instead
   */
  dismissId?: string | undefined;

  /**
   * Slot-specific CSS class overrides.
   */
  ui?:
    | {
        root?: string;
        content?: string;
        container?: string;
        left?: string;
        center?: string;
        right?: string;
        icon?: string;
        title?: string;
        actions?: string;
        close?: string;
        [key: string]: any;
      }
    | undefined;

  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;

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
  theme?: unknown;

  /**
   * Default slot children.
   */
  children?: JSX.Element;
  /** Replaces the leading icon. */
  leading?: JSX.Element;
  /** Replaces the title text. */
  titleSlot?: JSX.Element;
  /** Replaces the action buttons. */
  actionsSlot?: JSX.Element;
  /** Replaces the close button. */
  closeSlot?: JSX.Element;
  /** Content rendered in the left area. */
  left?: JSX.Element;
  /** Replaces the center area content (leading & title). */
  center?: JSX.Element;
  /** Content rendered in the right area, before actions & close button. */
  right?: JSX.Element;
  [key: string]: unknown;
}
