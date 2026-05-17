import { cx } from "css-variants"

export function resolveClasses<T extends (...args: never[]) => Record<string, string>>(
    themeFn: T,
    variants: Parameters<T>[0],
    mergedUI: Record<string, string | undefined>,
    rootClass?: string
): Record<string, string> {
  const resolved = themeFn(variants)
  const result: Record<string, string> = {}

  for (const [slot, value] of Object.entries(resolved)) {
    result[slot] = cx(value, mergedUI[slot])
  }

  if (rootClass) {
    result.root = cx(result.root ?? "", rootClass)
  }

  return result
}