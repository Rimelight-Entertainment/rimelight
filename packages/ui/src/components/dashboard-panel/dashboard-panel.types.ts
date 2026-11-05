import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { RLDashboardPanelTheme } from "./dashboard-panel.theme";

export type RLDashboardPanelProps = InferThemeProps<typeof RLDashboardPanelTheme> & {
  /**
   * Renders a drag handle after the panel (desktop only).
   * @default false
   */
  resizable?: boolean;
  /**
   * Content rendered above the body. Omitted when not provided.
   */
  headerSlot?: JSX.Element;
  /**
   * Replaces the default body content (`children`).
   */
  bodySlot?: JSX.Element;
  /**
   * Content rendered below the body. Omitted when not provided.
   */
  footerSlot?: JSX.Element;
  /**
   * Replaces the default drag handle. Only rendered when `resizable` is set.
   */
  handleSlot?: JSX.Element;
};
