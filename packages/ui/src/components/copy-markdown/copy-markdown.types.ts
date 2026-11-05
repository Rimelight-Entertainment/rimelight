import type { InferThemeProps } from "../../resolver";
import type { ButtonClickHandler, RLButtonProps } from "../button/button.types";
import type { RLCopyMarkdownTheme } from "./copy-markdown.theme";

/**
 * Props for `RLCopyMarkdown`. Every `RLButton` prop is forwarded to the rendered button; the
 * button's defaults apply (`color`, `variant`, `size`).
 */
export type RLCopyMarkdownProps = InferThemeProps<typeof RLCopyMarkdownTheme> &
  Omit<RLButtonProps, "ui" | "class" | "as" | "theme" | "children" | "onClick"> & {
    /**
     * Raw markdown content copied to the clipboard.
     */
    raw: string;
    /**
     * Click handler. Runs after the markdown is copied, so a consumer handler cannot replace the copy.
     */
    onClick?: ButtonClickHandler | undefined;
  };
