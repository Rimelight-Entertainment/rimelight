import type { InferThemeProps } from "../../resolver";
import type { RLChatTheme } from "./chat.theme";

/**
 * Request state of a conversation. `submitted` and `streaming` mark the region busy.
 */
export type RLChatStatus = "ready" | "submitted" | "streaming" | "error";

/**
 * Props for `RLChat`. Renders its children inside a labelled region.
 */
export type RLChatProps = InferThemeProps<typeof RLChatTheme> & {
  /**
   * Request state of the conversation. `submitted` and `streaming` set `aria-busy`.
   * @default "ready"
   */
  status?: RLChatStatus | undefined;
  /**
   * Accessible name for the conversation region.
   * @default "Conversation"
   */
  "aria-label"?: string | undefined;
};
