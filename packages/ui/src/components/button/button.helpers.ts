import type { ButtonClickHandler } from "./button";

export function toClickHandlers(
  onClick: ButtonClickHandler | ButtonClickHandler[] | null | undefined,
): ButtonClickHandler[] {
  if (!onClick) return [];
  return Array.isArray(onClick) ? onClick : [onClick];
}

export function isThenable(value: unknown): boolean {
  return Boolean(value) && typeof (value as { then?: unknown }).then === "function";
}

export function runClickHandlers(handlers: ButtonClickHandler[], event: MouseEvent): unknown[] {
  return handlers.map((handler) => handler(event));
}

export type KeyboardAction = "ignore" | "prevent" | "click";

export function resolveKeyboardAction(options: {
  key: string;
  repeat: boolean;
  disabled: boolean;
  defaultPrevented: boolean;
}): KeyboardAction {
  if (options.defaultPrevented) return "ignore";
  if (options.key !== "Enter" && options.key !== " ") return "ignore";
  if (options.disabled || options.repeat) return "prevent";
  return "click";
}
