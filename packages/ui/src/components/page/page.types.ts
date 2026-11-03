import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { RLPageTheme } from "./page.theme";

/**
 * Props for the page layout. Leading/trailing columns are internal layout variants and are not public props.
 */
export type RLPageProps = Omit<InferThemeProps<typeof RLPageTheme>, "leading" | "trailing"> & {
  /**
   * Content rendered in the leading column. The column is only rendered when provided.
   *
   * @default undefined
   */
  leadingSlot?: JSX.Element;
  /**
   * Content rendered in the trailing column. The column is only rendered when provided.
   *
   * @default undefined
   */
  trailingSlot?: JSX.Element;
};
