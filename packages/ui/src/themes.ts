import type { ComponentTheme } from "./types/component"

export { defineTheme } from "./utils/defineTheme"

const themeModules = import.meta.glob<{ default: ComponentTheme }>("./components/**/*.theme.ts", {
  eager: true
})

function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, char) => char.toUpperCase())
}

function themeNameFromFile(path: string): string {
  const lastSlash = path.lastIndexOf("/")
  const fileName =
    lastSlash !== -1 ? path.slice(lastSlash + 1, -9) : path.replace(/\.theme\.ts$/, "")
  return kebabToCamel(fileName)
}

export const uiConfig: Record<string, ComponentTheme> = Object.fromEntries(
  Object.entries(themeModules)
    .filter(([_, mod]) => Boolean(mod && mod.default))
    .map(([path, module]) => [themeNameFromFile(path), module.default])
)
