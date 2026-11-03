import type { InferThemeProps } from "../../resolver";
import type { RLStepsTheme } from "./steps.theme";

export type RLStepsProps = InferThemeProps<typeof RLStepsTheme> & {
  /**
   * Controls the size of the step indicators and spacing.
   * @default "md"
   */
  size?: "sm" | "md" | "lg" | undefined;
};
