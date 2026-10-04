import type { JSX } from "@solidjs/web";
import type { ThemeColor } from "../../types";

export interface RLToastProps {
  /**
   * Main toast title.
   */
  title?: string;
  /**
   * Description or message.
   */
  description?: string;
  /**
   * Visual variant.
   */
  variant?: "default" | "error" | "success" | "warning" | "info";
  /**
   * Action button label.
   */
  actionLabel?: string;
  /**
   * Duration in ms.
   */
  duration?: number;
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
   * Whether the toast can be dismissed by user or timeout.
   */
  dismissable?: boolean;
  onDismiss?: () => void;
  children?: JSX.Element;
  titleSlot?: JSX.Element;
  descriptionSlot?: JSX.Element;
  actionsSlot?: JSX.Element;
  [key: string]: unknown;
}
