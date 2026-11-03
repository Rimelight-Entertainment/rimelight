import type { InferThemeProps } from "../../resolver";
import type { RLLabelTheme } from "./label.theme";

export type RLLabelProps = InferThemeProps<typeof RLLabelTheme> & {
  /**
   * Id of the form control this label describes.
   * @default undefined
   */
  for?: string | undefined;
};
