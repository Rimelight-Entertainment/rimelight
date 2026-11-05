import type { InferThemeProps } from "../../resolver";
import type { RLChatPaletteTheme } from "./chat-palette.theme";

/**
 * Props for `RLChatPalette`. A group of suggested prompts or actions shown in a conversation.
 */
export type RLChatPaletteProps = InferThemeProps<typeof RLChatPaletteTheme> & {
  /**
   * Accessible name for the palette group.
   * @default "Suggestions"
   */
  "aria-label"?: string | undefined;
};
