import type { ComponentTheme } from "./defineTheme"

const themeModules = import.meta.glob<{ default: ComponentTheme }>("../components/**/*.theme.ts", {
  eager: true
})

function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, char) => char.toUpperCase())
}

function themeNameFromFile(path: string): string {
  const fileName = path.replace(/^\.\/|\.theme\.ts$/g, "")
  return kebabToCamel(fileName)
}

export const defaultUIConfig: Record<string, ComponentTheme> = Object.fromEntries(
  Object.entries(themeModules).map(([path, module]) => [themeNameFromFile(path), module.default])
)

export type DefaultUIConfig = typeof defaultUIConfig
