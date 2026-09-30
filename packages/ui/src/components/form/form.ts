export interface FormProps {
  /**
   * Validation schema (Zod or similar).
   */
  schema?: any;
  /**
   * Form state.
   */
  state?: any;
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  [key: string]: unknown;
}
