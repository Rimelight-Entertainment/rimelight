import type { InferThemeProps } from "../../resolver";
import type { RLDashboardGroupTheme } from "./dashboard-group.theme";

/**
 * Horizontal row that lays out the sidebar and panels of a dashboard.
 * @default as "div"
 */
export type RLDashboardGroupProps = InferThemeProps<typeof RLDashboardGroupTheme>;
