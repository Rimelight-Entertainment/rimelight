import type { InferThemeProps } from "../../resolver";
import type { RLAspectRatioTheme } from "./aspect-ratio.theme";

export type RLAspectRatioProps = InferThemeProps<typeof RLAspectRatioTheme> & {
  /**
   * The aspect ratio fraction/decimal (e.g. 16/9, 4/3, 1). Non-finite or non-positive values fall
   * back to 1 (square).
   *
   * @default 1
   */
  ratio?: number;
};
