import type { JSX } from "@solidjs/web";

export interface RLFormProps {
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
  children?: JSX.Element;
  onSubmit?: (e: Event & { currentTarget: HTMLFormElement }) => void;
  [key: string]: unknown;
}
