import type { ValidComponent } from "@solidjs/web";
import type { JSX } from "@solidjs/web";

export interface RLMainProps {
  /**
   * The element or component this component should render as.
   *
   * @default "main"
   */
  as?: ValidComponent;
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  children?: JSX.Element;
  [key: string]: unknown;
}
