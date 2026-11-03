import type { InferThemeProps } from "../../resolver";
import type { RLDashboardSidebarCollapseTheme } from "./dashboard-sidebar-collapse.theme";

export type RLDashboardSidebarCollapseProps = InferThemeProps<
  typeof RLDashboardSidebarCollapseTheme
> & {
  /**
   * Icon name shown on the collapse button.
   * @default "panel-left"
   */
  icon?: string;
};
