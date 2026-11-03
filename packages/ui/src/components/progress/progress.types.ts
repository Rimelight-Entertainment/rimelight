import type { InferThemeProps } from "../../resolver";
import type { RLProgressTheme } from "./progress.theme";

/**
 * Displays the completion state of a task.
 */
export type RLProgressProps = InferThemeProps<typeof RLProgressTheme> & {
  /**
   * Current value, between 0 and `max`.
   * @default 0
   */
  value?: number | undefined;

  /**
   * Upper bound of the progress range.
   * @default 100
   */
  max?: number | undefined;
};
