import type { InferThemeProps } from "../../resolver";
import type { RLChatStatus } from "../chat/chat.types";
import type { RLChatPromptSubmitTheme } from "./chat-prompt-submit.theme";

/**
 * Props for `RLChatPromptSubmit`. The send button of a prompt, which becomes a stop button while streaming.
 */
export type RLChatPromptSubmitProps = Omit<
  InferThemeProps<typeof RLChatPromptSubmitTheme>,
  "onClick" | "onKeyDown" | "ref"
> & {
  /**
   * Request state. `streaming` shows a stop control; `submitted` shows a loading state.
   * @default "ready"
   */
  status?: RLChatStatus | undefined;
  /**
   * Called when the stop control is pressed while `status` is `streaming`.
   * @default undefined
   */
  onStop?: (() => void) | undefined;
  /**
   * Disables the button.
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * Accessible name for the button.
   * @default "Send message" (or "Stop generating" while streaming)
   */
  "aria-label"?: string | undefined;
};
