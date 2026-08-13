import { getUIConfig } from "virtual:rimelight-ui"

const uiConfig = getUIConfig()
const themeCache = new Map<Function, any>()

export function resolveTheme<T>(
  themeDefault: T,
  themeCreator?: (colors: readonly string[]) => T
): T {
  if (uiConfig.colors && themeCreator) {
    let cached = themeCache.get(themeCreator)
    if (!cached) {
      cached = themeCreator(uiConfig.colors)
      themeCache.set(themeCreator, cached)
    }
    return cached
  }
  return themeDefault
}
