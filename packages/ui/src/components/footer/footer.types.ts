import type { SlotRenderer } from "../../types";
import type { InferThemeProps } from "../../resolver";
import type { RLFooterTheme } from "./footer.theme";

export type RLFooterProps = Omit<InferThemeProps<typeof RLFooterTheme>, "contain"> & {
  /**
   * Whether to contain the footer content within a max-width container.
   *
   * @default false
   */
  contain?: boolean;
  /**
   * Content rendered in the leading area.
   *
   * @default undefined
   */
  leadingSlot?: SlotRenderer;
  /**
   * Replaces the center area content. Falls back to `children` when omitted.
   *
   * @default undefined
   */
  centerSlot?: SlotRenderer;
  /**
   * Content rendered in the trailing area.
   *
   * @default undefined
   */
  trailingSlot?: SlotRenderer;
};
