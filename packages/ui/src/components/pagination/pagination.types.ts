import type { InferThemeProps } from "../../resolver";
import type { RLPaginationTheme } from "./pagination.theme";

export type RLPaginationProps = InferThemeProps<typeof RLPaginationTheme> & {
  /**
   * The current page (1-indexed). Setting it makes the component controlled.
   */
  page?: number | undefined;
  /**
   * The initial page (1-indexed) when uncontrolled.
   * @default 1
   */
  defaultPage?: number | undefined;
  /**
   * Total number of pages.
   * @default 1
   */
  totalPages?: number | undefined;
  /**
   * Called with the next page number when the user selects a page.
   */
  onValueChange?: ((page: number) => void) | undefined;
};
