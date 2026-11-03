import type { InferThemeProps } from "../../resolver";
import type { RLDashboardSearchTheme } from "./dashboard-search.theme";

export type RLDashboardSearchProps = InferThemeProps<typeof RLDashboardSearchTheme> & {
  /**
   * Controlled open state of the search dialog. Omit to let the component manage it.
   */
  open?: boolean;
  /**
   * Initial open state when uncontrolled.
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * Called when the dialog should open or close.
   */
  onOpenChange?: (open: boolean) => void;
};
