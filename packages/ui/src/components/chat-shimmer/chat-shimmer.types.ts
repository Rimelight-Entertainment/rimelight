import type { InferThemeProps } from "../../resolver";
import type { RLChatShimmerTheme } from "./chat-shimmer.theme";

/**
 * Props for `RLChatShimmer`. Animated gradient text that signals in-progress activity.
 */
export type RLChatShimmerProps = InferThemeProps<typeof RLChatShimmerTheme>;
