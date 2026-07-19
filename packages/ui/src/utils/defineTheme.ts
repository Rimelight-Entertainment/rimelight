import type { ComponentTheme } from "../types/component"

export function defineTheme<const T extends ComponentTheme>(theme: T): T {
  return theme
}
