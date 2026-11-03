import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { RLDashboardToolbarTheme } from "./dashboard-toolbar.theme";

export type RLDashboardToolbarProps = InferThemeProps<typeof RLDashboardToolbarTheme> & {
  /**
   * Content of the leading region (start edge). Used when `children` is not provided.
   */
  leadingSlot?: JSX.Element;
  /**
   * Content of the trailing region (end edge). Used when `children` is not provided.
   */
  trailingSlot?: JSX.Element;
};
