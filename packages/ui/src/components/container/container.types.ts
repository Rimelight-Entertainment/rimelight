import type { ValidComponent } from "@solidjs/web";
import type { JSX } from "@solidjs/web";

export interface RLContainerProps {
  /**
   * The component the root element should render as.
   *
   * @default "div"
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
