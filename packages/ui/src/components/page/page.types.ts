import type { JSX, ValidComponent } from "@solidjs/web";
import type { ClassValue, ThemeUI } from "../../types";

export type RLPageSlot = "root" | "left" | "center" | "right";

export interface RLPageProps {
  /**
   * The element or component this component should render as.
   *
   * @default "div"
   */
  as?: ValidComponent;
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: ThemeUI<RLPageSlot>;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: ClassValue;
  /**
   * Content rendered in the left column. The column is only rendered when provided.
   */
  leftSlot?: JSX.Element;
  /**
   * Content rendered in the right column. The column is only rendered when provided.
   */
  rightSlot?: JSX.Element;
  /**
   * Content rendered in the centered main column.
   */
  children?: JSX.Element;
  [key: string]: unknown;
}
