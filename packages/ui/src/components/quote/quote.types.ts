import type { InferThemeProps } from "../../resolver";
import type { SlotRenderer } from "../../types";
import type { RLQuoteTheme } from "./quote.theme";

export type RLQuoteProps = InferThemeProps<typeof RLQuoteTheme> & {
  /**
   * Replaces the children as the quoted text.
   * @default undefined (renders `children`)
   */
  quoteSlot?: SlotRenderer;
  /**
   * Attribution rendered below the quote as a `figcaption`. Not rendered when omitted.
   * @default undefined
   */
  captionSlot?: SlotRenderer;
};
