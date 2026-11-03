import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { RLDashboardSidebarTheme } from "./dashboard-sidebar.theme";

export type RLDashboardSidebarProps = InferThemeProps<typeof RLDashboardSidebarTheme> & {
  /**
   * Enables the collapse toggle, which shrinks the sidebar to icon width (desktop only).
   * @default false
   */
  collapsible?: boolean;
  /**
   * Controlled collapsed state. Omit to let the component manage it.
   */
  collapsed?: boolean;
  /**
   * Initial collapsed state when uncontrolled.
   * @default false
   */
  defaultCollapsed?: boolean;
  /**
   * Called when the collapsed state should change.
   */
  onCollapseChange?: (collapsed: boolean) => void;
  /**
   * Controlled open state of the mobile drawer. Omit to let the component manage it.
   */
  openMobile?: boolean;
  /**
   * Initial open state of the mobile drawer when uncontrolled.
   * @default false
   */
  defaultOpenMobile?: boolean;
  /**
   * Called when the mobile drawer should open or close.
   */
  onOpenMobileChange?: (open: boolean) => void;
  /**
   * Content rendered above the body. Omitted when not provided.
   */
  headerSlot?: JSX.Element;
  /**
   * Content rendered below the body. Omitted when not provided.
   */
  footerSlot?: JSX.Element;
};
