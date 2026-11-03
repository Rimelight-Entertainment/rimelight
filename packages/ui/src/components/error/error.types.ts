import type { JSX } from "@solidjs/web";
import type { ThemeColor } from "../../types";
import type { InferThemeProps } from "../../resolver";
import type { RLButtonProps } from "../button/button.types";
import type { RLErrorTheme } from "./error.theme";

/**
 * Button shown below the error text. Takes `href` or `onClick`.
 */
export type RLErrorAction = {
  /**
   * Button text.
   */
  label: string;

  /**
   * Icon name rendered before the label.
   * @default undefined
   */
  icon?: string;

  /**
   * Button color.
   * @default undefined; the button default applies.
   */
  color?: ThemeColor;

  /**
   * Button variant.
   * @default undefined; the button default applies.
   */
  variant?: RLButtonProps["variant"];

  /**
   * Target URL. Renders the button as a link.
   * @default undefined
   */
  href?: string;

  /**
   * Click handler.
   * @default undefined
   */
  onClick?: RLButtonProps["onClick"];

  /**
   * Additional CSS classes for the button.
   * @default undefined
   */
  class?: string;
};

/**
 * Error props. `@status stable`.
 */
export type RLErrorProps = InferThemeProps<typeof RLErrorTheme> & {
  /**
   * HTTP status code. Picks the default icon, color and title.
   * @default read from `error` (an `HttpError`), otherwise 500.
   */
  status?: number;

  /**
   * The thrown value. Used for the status, for an exposed `HttpError` message,
   * and for the details panel in development.
   * @default undefined
   */
  error?: unknown;

  /**
   * Title text.
   * @default a generic title for the status.
   */
  title?: string;

  /**
   * Description text.
   * @default an exposed `HttpError` message, otherwise a generic one for the status.
   */
  description?: string;

  /**
   * Icon name.
   * @default an icon for the status.
   */
  icon?: string;

  /**
   * Hide the status pill.
   * @default false
   */
  hideStatus?: boolean;

  /**
   * Buttons below the text.
   * @default a single "Go home" link to `/` (localized automatically); pass `[]` for none.
   */
  actions?: RLErrorAction[];

  /**
   * Show the error message and stack.
   * @default true only in development.
   */
  showDetails?: boolean;

  /**
   * Replaces the icon box.
   * @default undefined
   */
  iconSlot?: JSX.Element;

  /**
   * Replaces the action buttons.
   * @default undefined
   */
  actionsSlot?: JSX.Element;

  /**
   * Content at the bottom of the card.
   * @default undefined
   */
  footerSlot?: JSX.Element;
};
