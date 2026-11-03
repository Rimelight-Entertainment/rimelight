import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { RLQuoteTheme } from "./quote.theme";

export type RLQuoteProps = InferThemeProps<typeof RLQuoteTheme> & {
  /**
   * Replaces the children as the quoted text.
   * @default undefined (renders `children`)
   */
  quoteSlot?: JSX.Element;
  /**
   * Attribution rendered below the quote as a `figcaption`. Not rendered when omitted.
   * @default undefined
   */
  captionSlot?: JSX.Element;
};
