import type { ValidComponent } from "@solidjs/web";
import type { JSX } from "@solidjs/web";

export interface RLCalloutProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: ValidComponent;
  /**
   * The visual color scheme of the callout.
   * @defaultValue 'primary'
   */
  color?:
    | "error"
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "neutral"
    | (string & {})
    | undefined;
  /**
   * The visual variant of the callout.
   * @defaultValue 'solid'
   */
  variant?: "solid" | "outline" | "soft" | "subtle" | undefined;
  /**
   * The orientation between the content and the actions.
   * @defaultValue 'vertical'
   */
  orientation?: "vertical" | "horizontal" | undefined;
  /**
   * The main title text of the callout.
   */
  title?: string | undefined;
  /**
   * The secondary description text of the callout.
   */
  description?: string | undefined;
  /**
   * An optional leading icon name.
   */
  icon?: string | undefined;
  /**
   * An optional avatar configuration or image source URL string.
   */
  avatar?: { src: string; alt: string } | string | undefined;
  /**
   * Display a list of action buttons:
   * - under the title and description when orientation is `vertical`
   * - next to the close button when orientation is `horizontal`
   */
  actions?: any[] | undefined;
  /**
   * Display a close button to dismiss the callout.
   * Can be a boolean or custom object.
   * @defaultValue false
   */
  close?: boolean | Record<string, unknown> | undefined;
  /**
   * The icon displayed in the close button.
   * @defaultValue 'close'
   */
  closeIcon?: string | undefined;
  /**
   * Controlled open state for the callout.
   */
  open?: boolean | undefined;
  /**
   * Initial open state when uncontrolled.
   * @defaultValue true
   */
  defaultOpen?: boolean | undefined;
  /**
   * Callback fired when the callout is dismissed.
   */
  onClose?: (() => void) | undefined;
  /**
   * Callback fired when the open state changes.
   */
  onOpenChange?: ((open: boolean) => void) | undefined;
  /**
   * Theme mode override — pins colors to flat, light, or dark mode.
   */
  theme?: "light" | "dark" | undefined;
  /**
   * Slot-specific CSS class overrides.
   */
  ui?:
    | Partial<
        Record<
          | "root"
          | "wrapper"
          | "title"
          | "description"
          | "icon"
          | "avatar"
          | "avatarSize"
          | "actions"
          | "close",
          unknown
        >
      >
    | undefined;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  /**
   * Explicit element ID for accessibility linkages.
   */
  id?: string | undefined;
  /**
   * Accessible aria-label override.
   */
  ariaLabel?: string | undefined;
  /**
   * Accessible aria-labelledby ID override.
   */
  ariaLabelledby?: string | undefined;
  /**
   * Accessible aria-describedby ID override.
   */
  ariaDescribedby?: string | undefined;
  leading?: JSX.Element;
  iconSlot?: JSX.Element;
  titleSlot?: JSX.Element;
  headerSlot?: JSX.Element;
  descriptionSlot?: JSX.Element;
  actionsSlot?: JSX.Element;
  closeSlot?: JSX.Element;
  avatarSlot?: JSX.Element;
  children?: JSX.Element;
  [key: string]: unknown;
}
