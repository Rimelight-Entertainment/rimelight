import type { JSX } from "@solidjs/web";
import type { ThemeColor } from "../../types";

export interface RLFileUploadProps {
  /**
   * Accepted file types (e.g. 'image/*', 'application/pdf').
   */
  accept?: string;
  /**
   * Allow multiple file selection.
   */
  multiple?: boolean;
  /**
   * Disabled state.
   */
  disabled?: boolean;
  /**
   * Title text shown inside the file upload area.
   */
  title?: string;
  /**
   * Description text shown inside.
   */
  description?: string;
  /**
   * Icon shown inside.
   */
  icon?: string;
  /**
   * Color theme.
   */
  color?: ThemeColor;
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  /**
   * Click event handler.
   */
  onChange?: (e: Event & { currentTarget: HTMLInputElement }) => void;
  /**
   * Slot for the icon.
   */
  iconSlot?: JSX.Element;
  /**
   * Default slot children.
   */
  children?: JSX.Element;
  [key: string]: unknown;
}
