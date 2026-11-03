import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { RLFieldGroupTheme } from "./field-group.theme";

export type RLFieldGroupProps = InferThemeProps<typeof RLFieldGroupTheme> & {
  /**
   * Content rendered before the grouped field (e.g. an icon or addon text).
   */
  leadingSlot?: JSX.Element;
  /**
   * Content rendered after the grouped field (e.g. an icon or addon text).
   */
  trailingSlot?: JSX.Element;
};
