import type { JSX } from "@solidjs/web";
import type { ThemeColor } from "../../types";
import type { ButtonProps } from "../button/button";
import type { LinkProps } from "../link/link";

export type BannerColor =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "neutral"
  | ThemeColor;

export interface BannerAction extends ButtonProps {
  [key: string]: unknown;
}

export interface BannerSlots {
  leading?: JSX.Element | (() => JSX.Element);
  title?: JSX.Element | (() => JSX.Element);
  actions?: JSX.Element | (() => JSX.Element);
  close?: JSX.Element | (() => JSX.Element);
  left?: JSX.Element | (() => JSX.Element);
  center?: JSX.Element | (() => JSX.Element);
  right?: JSX.Element | (() => JSX.Element);
  default?: JSX.Element | (() => JSX.Element);
}

export interface BannerProps extends LinkProps {
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
   * The URL the banner links to (Nuxt UI parity alias for href).
   */
  to?: string | undefined;

  /**
   * Text or node title of the banner.
   */
  title?: string | JSX.Element | undefined;

  /**
   * Display a list of actions next to the title.
   */
  actions?: BannerAction[] | undefined;

  /**
   * Color variant of the banner.
   *
   * @default "primary"
   */
  color?: BannerColor | undefined;

  /**
   * Display a close button to dismiss the banner. Can be boolean or button props override.
   *
   * @default false
   */
  close?: boolean | ButtonProps | undefined;

  /**
   * The icon displayed in the close button.
   *
   * @default "close"
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

  [key: string]: unknown;
}
