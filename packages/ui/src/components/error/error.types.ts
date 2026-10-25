import type { JSX } from "@solidjs/web";
import type { ThemeColor } from "../../types";
import type { RLButtonProps } from "../button/button.types";

export interface RLErrorAction {
  label: string;
  icon?: string;
  color?: ThemeColor;
  variant?: RLButtonProps["variant"];
  href?: string;
  onClick?: RLButtonProps["onClick"];
  class?: string;
  [key: string]: any;
}

export interface RLErrorProps {
  /**
   * HTTP status code. Picks the default icon, color and title.
   * When omitted, it is read from `error` (an `HttpError`), otherwise 500.
   */
  status?: number;
  /**
   * The thrown value. Used for the status, for an exposed `HttpError` message,
   * and for the details panel in development.
   */
  error?: unknown;
  /**
   * Title text. Defaults to a generic title for the status.
   */
  title?: string;
  /**
   * Description text. Defaults to an exposed `HttpError` message, otherwise a generic one.
   */
  description?: string;
  /**
   * Icon name. Defaults to an icon for the status.
   */
  icon?: string;
  /**
   * Accent color. Defaults to a color for the status.
   */
  color?: ThemeColor;
  /**
   * Hide the status pill.
   */
  hideStatus?: boolean;
  /**
   * Buttons below the text. Each takes `href` or `onClick`.
   * Defaults to a single "Go home" link to `/` (localized automatically); pass `[]` for none.
   * Built-in text is translated by ui and can be overridden in the app's i18n JSON under `rimelight.ui.error`.
   */
  actions?: RLErrorAction[];
  /**
   * Show the error message and stack. (default: true only in development)
   */
  showDetails?: boolean;
  /**
   * Fill the viewport height (page use). Set false to use inline, e.g. inside a widget. (default: true)
   */
  fullscreen?: boolean;
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: {
    root?: string;
    card?: string;
    badge?: string;
    dot?: string;
    badgeLabel?: string;
    icon?: string;
    header?: string;
    title?: string;
    description?: string;
    body?: string;
    details?: string;
    actions?: string;
    footer?: string;
  };
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  /**
   * Extra content inside the card, below the description (e.g. account info).
   */
  children?: JSX.Element;
  /**
   * Replaces the icon box.
   */
  iconSlot?: JSX.Element;
  /**
   * Replaces the action buttons.
   */
  actionsSlot?: JSX.Element;
  /**
   * Content at the bottom of the card.
   */
  footerSlot?: JSX.Element;
  [key: string]: unknown;
}
