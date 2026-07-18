import { basename } from "node:path"
import type { ComponentTheme } from "./types/theme"

const themeModules = import.meta.glob<{ default: ComponentTheme }>("./components/**/*.theme.ts", {
  eager: true
})

function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, char) => char.toUpperCase())
}

function themeNameFromFile(path: string): string {
  return kebabToCamel(basename(path, ".theme.ts"))
}

export const uiConfig: Record<string, ComponentTheme> = Object.fromEntries(
  Object.entries(themeModules).map(([path, module]) => [themeNameFromFile(path), module.default])
)

export type UIConfigMap = Record<string, ComponentTheme>
