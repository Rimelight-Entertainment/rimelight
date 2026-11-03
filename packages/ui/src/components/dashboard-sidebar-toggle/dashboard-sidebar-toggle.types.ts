import type { InferThemeProps } from "../../resolver";
import type { RLDashboardSidebarToggleTheme } from "./dashboard-sidebar-toggle.theme";

export type RLDashboardSidebarToggleProps = InferThemeProps<
  typeof RLDashboardSidebarToggleTheme
> & {
  /**
   * Icon name shown on the toggle button.
   * @default "menu"
   */
  icon?: string;
};
