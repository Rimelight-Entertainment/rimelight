import { cx } from "css-variants"
// @ts-ignore
import { getUIConfig } from "virtual:rimelight-ui"

export function resolveClasses<T extends (...args: never[]) => Record<string, string>>(
  themeFn: T,
  variants: Parameters<T>[0],
  mergedUI: Record<string, string | Function | undefined>,
  rootClass?: string
): Record<string, string> {
  const uiConfig = getUIConfig()
  const isUnstyled = uiConfig?.unstyled === true

  const resolved = isUnstyled ? {} : themeFn(variants)
  const result: Record<string, string> = {}

  // Fill in slots from theme function or default to empty strings if unstyled
  const slots = isUnstyled ? Object.keys(mergedUI) : Object.keys(resolved)
  if (isUnstyled && rootClass && !slots.includes("root")) {
    slots.push("root")
  }

  for (const slot of slots) {
    const value = isUnstyled ? "" : (resolved[slot] ?? "")
    const override = mergedUI[slot]
    if (typeof override === "function") {
      result[slot] = cx(override(value))
    } else {
      result[slot] = cx(value, override)
    }
  }

  if (rootClass) {
    result.root = cx(result.root ?? "", rootClass)
  }

  return result
}
