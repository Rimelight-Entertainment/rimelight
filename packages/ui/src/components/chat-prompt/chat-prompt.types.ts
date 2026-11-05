import type { InferThemeProps } from "../../resolver";
import type { RLChatPromptTheme } from "./chat-prompt.theme";

/**
 * Props for `RLChatPrompt`. A multi-line message composer. Enter submits, Shift+Enter inserts a newline.
 */
export type RLChatPromptProps = InferThemeProps<typeof RLChatPromptTheme> & {
  /**
   * Controlled text. Leave undefined to let the prompt manage its own text.
   * @default undefined
   */
  value?: string | undefined;
  /**
   * Initial text when uncontrolled.
   * @default ""
   */
  defaultValue?: string | undefined;
  /**
   * Called with the new text on every edit, including the clear after a submit.
   * @default undefined
   */
  onValueChange?: ((value: string) => void) | undefined;
  /**
   * Called with the trimmed text when the prompt is submitted. Blank text is never submitted.
   * @default undefined
   */
  onSubmit?: ((value: string) => void) | undefined;
  /**
   * Text shown while the field is empty.
   * @default "Type a message"
   */
  placeholder?: string | undefined;
  /**
   * Form field name for the text.
   * @default undefined
   */
  name?: string | undefined;
  /**
   * Disables the field and submission.
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * Accessible name for the text field.
   * @default "Message"
   */
  "aria-label"?: string | undefined;
};
