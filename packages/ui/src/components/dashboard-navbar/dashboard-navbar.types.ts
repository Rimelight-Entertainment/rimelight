import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { RLDashboardNavbarTheme } from "./dashboard-navbar.theme";

export type RLDashboardNavbarProps = InferThemeProps<typeof RLDashboardNavbarTheme> & {
  /**
   * Icon name shown before the title. Ignored when `leadingSlot` is provided.
   */
  icon?: string;
  /**
   * Title text. Ignored when `titleSlot` is provided.
   */
  title?: string;
  /**
   * Edge the mobile sidebar toggle sits on.
   * @default "left"
   */
  side?: "left" | "right";
  /**
   * Shows the mobile sidebar toggle button.
   * @default true
   */
  hasToggle?: boolean;
  /**
   * Replaces the whole leading region (icon, title and toggle excluded from the default layout).
   */
  leadingSlot?: JSX.Element;
  /**
   * Replaces the default icon. Ignored when `leadingSlot` is provided.
   */
  iconSlot?: JSX.Element;
  /**
   * Replaces the default title text. Ignored when `leadingSlot` is provided.
   */
  titleSlot?: JSX.Element;
  /**
   * Replaces the center content. Falls back to `children`.
   */
  centerSlot?: JSX.Element;
  /**
   * Content rendered at the trailing edge, before the toggle when `side` is `"right"`.
   */
  trailingSlot?: JSX.Element;
};
