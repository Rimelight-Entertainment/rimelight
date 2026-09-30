export interface SlideoverProps {
  /**
   * The edge the sheet slides in from.
   */
  side?: "top" | "right" | "bottom" | "left";
  /**
   * Controlled open state.
   */
  open?: boolean;
  /**
   * Title of the sheet.
   */
  title?: string;
  /**
   * Description of the sheet contents.
   */
  description?: string;
  /**
   * Label of the trigger button.
   */
  triggerLabel?: string;
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  /**
   * Keep content mounted in the DOM when hidden.
   */
  unmountOnHide?: boolean;
  [key: string]: unknown;
}
