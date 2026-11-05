import type { InferThemeProps } from "../../resolver";
import type { RLChatMessageTheme } from "./chat-message.theme";

/**
 * Props for `RLChatMessage`. Renders one message in a conversation.
 */
export type RLChatMessageProps = InferThemeProps<typeof RLChatMessageTheme> & {
  /**
   * Speaker of the message. Drives alignment and styling.
   * @default "assistant"
   */
  from?: "user" | "assistant" | "system" | undefined;
};
