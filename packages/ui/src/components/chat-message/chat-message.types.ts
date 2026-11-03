import type { InferThemeProps } from "../../resolver";
import type { RLChatMessageTheme } from "./chat-message.theme";

/**
 * Props for `RLChatMessage`. Renders its children inside the themed root.
 *
 * @status stub
 */
export type RLChatMessageProps = InferThemeProps<typeof RLChatMessageTheme>;
