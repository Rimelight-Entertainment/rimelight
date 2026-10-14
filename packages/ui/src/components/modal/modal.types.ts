import type { JSX } from "@solidjs/web";

export type RLModalSize = "xs" | "sm" | "md" | "lg" | "xl" | "fullscreen";

export interface RLModalUiSlots {
  root?: string | undefined;
  trigger?: string | undefined;
  overlay?: string | undefined;
  backdrop?: string | undefined;
  content?: string | undefined;
  header?: string | undefined;
  wrapper?: string | undefined;
  body?: string | undefined;
  footer?: string | undefined;
  title?: string | undefined;
  description?: string | undefined;
  close?: string | undefined;
  closeButton?: string | undefined;
  actions?: string | undefined;
}

export interface RLModalProps {
  /**
   * Title text displayed in the modal header.
   */
  title?: string | undefined;

  /**
   * Description text displayed below the title in the modal header.
   */
  description?: string | undefined;

  /**
   * Controlled open state.
   */
  open?: boolean | undefined;

  /**
   * Initial open state when uncontrolled.
   * @default false
   */
  defaultOpen?: boolean | undefined;

  /**
   * Modal size preset.
   * @default "md"
   */
  size?: RLModalSize | undefined;

  /**
   * Render an overlay / backdrop behind the modal.
   * @default true
   */
  overlay?: boolean | undefined;

  /**
   * When true, enables scrollable overlay mode where content scrolls within the overlay container.
   * @default false
   */
  scrollable?: boolean | undefined;

  /**
   * Animate the modal when opening or closing.
   * @default true
   */
  transition?: boolean | undefined;

  /**
   * When true, the modal will take up the full screen.
   * @default false
   */
  fullscreen?: boolean | undefined;

  /**
   * Render the modal in a portal attached to document body or target element.
   * Set to false to render inline.
   * @default true
   */
  portal?: boolean | HTMLElement | string | undefined;

  /**
   * Display a close button to dismiss the modal, or pass button props object to customize.
   * Set to false to hide the close button.
   * @default true
   */
  close?: boolean | Record<string, any> | undefined;

  /**
   * Icon displayed inside the header close button.
   * @default "x"
   */
  closeIcon?: any;

  /**
   * When false, the modal will not close when clicking outside or pressing Escape.
   * A close:prevent event is emitted instead.
   * @default true
   */
  dismissible?: boolean | undefined;

  /**
   * The modality of the dialog. When true, interaction with outside elements is blocked.
   * When false, overlay is disabled and outside content remains interactive.
   * @default true
   */
  modal?: boolean | undefined;

  /**
   * Prevents body scrolling when open.
   * @default true
   */
  lockScroll?: boolean | undefined;

  /**
   * Keep content mounted in the DOM when hidden.
   * @default true
   */
  unmountOnHide?: boolean | undefined;

  /**
   * Trigger label to render a default trigger button.
   */
  triggerLabel?: string | undefined;

  /**
   * WAI-ARIA role attribute for dialog container.
   * @default "dialog"
   */
  role?: any;

  /**
   * Explicit aria-label for accessibility.
   */
  ariaLabel?: string | undefined;

  /**
   * Alias for ariaLabel.
   */
  "aria-label"?: string | undefined;

  /**
   * Explicit aria-labelledby element id.
   */
  ariaLabelledby?: string | undefined;

  /**
   * Alias for ariaLabelledby.
   */
  "aria-labelledby"?: string | undefined;

  /**
   * Explicit aria-describedby element id.
   */
  ariaDescribedby?: string | undefined;

  /**
   * Alias for ariaDescribedby.
   */
  "aria-describedby"?: string | undefined;

  /**
   * Slot-specific CSS class overrides.
   */
  ui?: Partial<RLModalUiSlots> | undefined;

  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;

  /**
   * Default slot / modal body content.
   */
  children?: JSX.Element;

  /**
   * Trigger element slot.
   */
  trigger?: JSX.Element | (() => JSX.Element) | undefined;

  /**
   * Explicit trigger slot prop.
   */
  triggerSlot?: JSX.Element | (() => JSX.Element) | undefined;

  /**
   * Whole content override slot.
   */
  content?: JSX.Element | (() => JSX.Element) | undefined;

  /**
   * Explicit content slot prop.
   */
  contentSlot?: JSX.Element | (() => JSX.Element) | undefined;

  /**
   * Header section slot override.
   */
  header?: JSX.Element | (() => JSX.Element) | undefined;

  /**
   * Explicit header slot prop.
   */
  headerSlot?: JSX.Element | (() => JSX.Element) | undefined;

  /**
   * Custom title slot.
   */
  titleSlot?: JSX.Element | (() => JSX.Element) | undefined;

  /**
   * Custom description slot.
   */
  descriptionSlot?: JSX.Element | (() => JSX.Element) | undefined;

  /**
   * Actions slot inside header.
   */
  actions?: JSX.Element | (() => JSX.Element) | undefined;

  /**
   * Explicit actions slot prop.
   */
  actionsSlot?: JSX.Element | (() => JSX.Element) | undefined;

  /**
   * Custom close button slot.
   */
  closeSlot?: JSX.Element | (() => JSX.Element) | undefined;

  /**
   * Modal body content slot.
   */
  body?: JSX.Element | (() => JSX.Element) | undefined;

  /**
   * Explicit body slot prop.
   */
  bodySlot?: JSX.Element | (() => JSX.Element) | undefined;

  /**
   * Modal footer section slot.
   */
  footer?: JSX.Element | (() => JSX.Element) | undefined;

  /**
   * Explicit footer slot prop.
   */
  footerSlot?: JSX.Element | (() => JSX.Element) | undefined;

  /**
   * Callback fired when open state changes.
   */
  onOpenChange?: ((open: boolean) => void) | undefined;

  /**
   * Callback fired when modal is closed.
   */
  onClose?: (() => void) | undefined;

  /**
   * Callback fired when dismissal is attempted while dismissible is false.
   */
  onClosePrevent?: (() => void) | undefined;

  /**
   * Callback fired when modal enters.
   */
  onEnter?: (() => void) | undefined;

  /**
   * Callback fired after enter transition completes.
   */
  onAfterEnter?: (() => void) | undefined;

  /**
   * Callback fired when modal leaves.
   */
  onLeave?: (() => void) | undefined;

  /**
   * Callback fired after leave transition completes.
   */
  onAfterLeave?: (() => void) | undefined;

  [key: string]: unknown;
}
