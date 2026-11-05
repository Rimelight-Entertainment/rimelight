import type { InferThemeProps } from "../../resolver";
import type { RLChatReasoningTheme } from "./chat-reasoning.theme";

/**
 * Props for `RLChatReasoning`. A collapsible block showing the model's reasoning.
 */
export type RLChatReasoningProps = InferThemeProps<typeof RLChatReasoningTheme> & {
  /**
   * Summary text shown on the trigger.
   * @default "Reasoning"
   */
  label?: string | undefined;
  /**
   * Shows the summary with a shimmer while the model is still reasoning.
   * @default false
   */
  streaming?: boolean | undefined;
  /**
   * Opens the reasoning block on first render.
   * @default false
   */
  defaultOpen?: boolean | undefined;
};
