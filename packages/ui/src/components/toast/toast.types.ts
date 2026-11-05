import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { SlotRenderer, ThemeColor } from "../../types";
import type { RLToastTheme } from "./toast.theme";

export type RLToastProps = Omit<InferThemeProps<typeof RLToastTheme>, "color"> & {
  /**
   * Intent color. Drives the icon and styling.
   *
   * @default "primary"
   */
  color?: ThemeColor | undefined;
  /**
   * Main toast title. Use `titleSlot` for JSX.
   */
  title?: string | undefined;
  /**
   * Description or message. Use `descriptionSlot` for JSX.
   */
  description?: string | undefined;
  /**
   * Duration in milliseconds. `0` keeps the toast open until dismissed.
   *
   * @default 6000
   */
  duration?: number | undefined;
  /**
   * Whether the toast can be dismissed by the close button or the timeout. Non-dismissible toasts never time out.
   *
   * @default true
   */
  dismissible?: boolean | undefined;
  /**
   * Called after the toast is dismissed.
   */
  onDismiss?: (() => void) | undefined;
  /**
   * Toast body content, rendered below the title and description.
   */
  children?: JSX.Element | undefined;
  /**
   * Title content. Takes precedence over the `title` string.
   */
  titleSlot?: SlotRenderer | undefined;
  /**
   * Description content. Takes precedence over the `description` string.
   */
  descriptionSlot?: SlotRenderer | undefined;
  /**
   * Action content, rendered below the body.
   */
  actionsSlot?: SlotRenderer | undefined;
};

/**
 * A toast queued in the global store. Created by `addToast` and removed by `removeToast`.
 */
export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  color?: ThemeColor;
  duration?: number;
  onDismiss?: () => void;
}
