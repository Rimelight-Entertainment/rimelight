import type { InferThemeProps } from "../../resolver";
import type { RLGamepadTheme } from "./gamepad.theme";

export interface HighlightGroup {
  label: string;
  buttons: string[];
  color: string;
}

export type RLGamepadProps = InferThemeProps<typeof RLGamepadTheme> & {
  /**
   * Buttons to highlight directly (in addition to group-based highlights).
   */
  highlightedButtons?: string[] | undefined;

  /**
   * Highlight groups, each with a label, button ids, and highlight color.
   */
  groups?: HighlightGroup[] | undefined;

  /**
   * Fallback highlight color for directly highlighted buttons.
   * @default 'var(--rl-primary-500)'
   */
  highlightColor?: string | undefined;

  /**
   * Background color rendered behind the gamepad body.
   * @default 'transparent'
   */
  backgroundColor?: string | undefined;
};
