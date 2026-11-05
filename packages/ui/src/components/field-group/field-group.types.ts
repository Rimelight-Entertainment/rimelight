import type { InferThemeProps } from "../../resolver";
import type { SlotRenderer } from "../../types";
import type { RLFieldGroupTheme } from "./field-group.theme";

export type RLFieldGroupProps = InferThemeProps<typeof RLFieldGroupTheme> & {
  /**
   * Content rendered before the grouped field (e.g. an icon or addon text).
   * @default undefined
   */
  leadingSlot?: SlotRenderer;
  /**
   * Content rendered after the grouped field (e.g. an icon or addon text).
   * @default undefined
   */
  trailingSlot?: SlotRenderer;
};
