/**
 * Whether a key event should submit the prompt. Enter submits; Shift+Enter inserts a newline;
 * Enter during IME composition belongs to the input method.
 */
export function isSubmitKey(
  event: Pick<KeyboardEvent, "key" | "shiftKey" | "isComposing">,
): boolean {
  return event.key === "Enter" && !event.shiftKey && !event.isComposing;
}
