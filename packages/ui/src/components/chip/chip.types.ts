import type { InferThemeProps } from "../../resolver";
import type { SlotRenderer } from "../../types";
import type { RLChipTheme } from "./chip.theme";

/**
 * Chip indicator wrapping a component.
 */
export type RLChipProps = InferThemeProps<typeof RLChipTheme> & {
  /**
   * Display some text or numeric count inside the chip.
   * @default undefined
   */
  text?: string | number | undefined;

  /**
   * Controls the visibility of the chip indicator.
   * @default true
   */
  show?: boolean | undefined;

  /**
   * Replaces the `text` content with custom JSX.
   * @default undefined
   */
  labelSlot?: SlotRenderer;
};
