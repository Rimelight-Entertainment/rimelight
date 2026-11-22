import type { ButtonClickHandler } from "./button.types";

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

/**
 * Pre-D5 Button variant names, kept as deprecated aliases (ST3.3). The web Button never had
 * these as variants; consumers passed them anyway, so they map onto the catalogue vocabulary:
 * primary -> solid + primary, secondary -> outline + neutral, danger -> solid + error.
 */
export type LegacyButtonVariant = "primary" | "secondary" | "danger";

const LEGACY_BUTTON_VARIANTS: Record<LegacyButtonVariant, { variant: string; color: string }> = {
  primary: { variant: "solid", color: "primary" },
  secondary: { variant: "outline", color: "neutral" },
  danger: { variant: "solid", color: "error" },
};

export function resolveButtonVariant(
  variant: string | undefined,
  color: string | undefined,
): { variant: string | undefined; color: string | undefined } {
  const legacy =
    variant !== undefined && Object.hasOwn(LEGACY_BUTTON_VARIANTS, variant)
      ? LEGACY_BUTTON_VARIANTS[variant as LegacyButtonVariant]
      : undefined;
  if (!legacy) return { variant, color };
  return { variant: legacy.variant, color: color ?? legacy.color };
}
