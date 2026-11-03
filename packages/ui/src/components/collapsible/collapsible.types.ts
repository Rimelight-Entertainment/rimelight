import type { ValidComponent } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import type { ClassValue } from "../../types";

export interface RLCollapsibleSlots {
  /**
   * Classes applied to the root element.
   */
  root?: ClassValue;
  /**
   * Classes applied to the trigger container element.
   */
  trigger?: ClassValue;
  /**
   * Classes applied to the collapsible content container element.
   */
  content?: ClassValue;
}

export interface RLCollapsibleProps {
  /**
   * The element or component this component should render as.
   * @default 'div'
   */
  as?: ValidComponent;

  /**
   * Slot-specific CSS class overrides.
   */
  ui?: Partial<RLCollapsibleSlots>;

  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: ClassValue;

  /**
   * When `true`, prevents the user from interacting with the collapsible.
   */
  disabled?: boolean;

  /**
   * The open state of the collapsible when it is initially rendered.
   * Use when you do not need to control its open state.
   * @default false
   */
  defaultOpen?: boolean;

  /**
   * The controlled open state of the collapsible.
   */
  open?: boolean;

  /**
   * When `true`, the element will be unmounted on closed state.
   * @default true
   */
  unmountOnHide?: boolean;

  /**
   * Default slot / trigger element or render prop function.
   */
  children?: JSX.Element | ((props: { open: boolean }) => JSX.Element);

  /**
   * Content displayed when open. Element or render function.
   */
  contentSlot?: JSX.Element | ((props?: Record<string, unknown>) => JSX.Element);

  /**
   * Trigger element or render function receiving `{ open }`.
   */
  triggerSlot?: JSX.Element | ((props: { open: boolean }) => JSX.Element);

  /**
   * Callback fired when the open state of the collapsible changes.
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Optional HTML id for the root element.
   */
  id?: string;

  /**
   * Optional theme variant override.
   */
  theme?: string;

  /**
   * Accessibility label for the collapsible.
   */
  ariaLabel?: string;

  /**
   * Accessibility labelledby id reference.
   */
  ariaLabelledby?: string;

  /**
   * Accessibility describedby id reference.
   */
  ariaDescribedby?: string;

  [key: string]: unknown;
}
