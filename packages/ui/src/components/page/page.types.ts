import type { InferThemeProps } from "../../resolver";
import type { SlotRenderer } from "../../types";
import type { RLPageTheme } from "./page.theme";

/**
 * Props for the page layout. Leading and trailing columns are rendered only when their slot is provided.
 */
export type RLPageProps = Omit<
  InferThemeProps<typeof RLPageTheme>,
  "hasLeading" | "hasTrailing"
> & {
  /**
   * Content rendered in the leading column. The column is only rendered when provided.
   *
   * @default undefined
   */
  leadingSlot?: SlotRenderer;
  /**
   * Content rendered in the trailing column. The column is only rendered when provided.
   *
   * @default undefined
   */
  trailingSlot?: SlotRenderer;
};
