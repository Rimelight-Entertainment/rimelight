import type { InferThemeProps } from "../../resolver";
import type { RLDashboardResizeHandleTheme } from "./dashboard-resize-handle.theme";

/**
 * Drag handle between two dashboard panels. Rendered with `role="separator"`.
 * @default as "div"
 */
export type RLDashboardResizeHandleProps = InferThemeProps<typeof RLDashboardResizeHandleTheme>;
