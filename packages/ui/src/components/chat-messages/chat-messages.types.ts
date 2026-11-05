import type { InferThemeProps } from "../../resolver";
import type { RLChatMessagesTheme } from "./chat-messages.theme";

/**
 * Props for `RLChatMessages`. Renders the scrollable message list of a conversation.
 */
export type RLChatMessagesProps = InferThemeProps<typeof RLChatMessagesTheme> & {
  /**
   * Accessible name for the message log.
   * @default "Messages"
   */
  "aria-label"?: string | undefined;
};
