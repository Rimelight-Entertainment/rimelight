import { getUIConfig } from "virtual:rimelight-ui"

const uiConfig = getUIConfig()

export function resolveTheme<T>(
  themeDefault: T,
  themeCreator?: (colors: readonly string[]) => T
): T {
  if (uiConfig.colors && themeCreator) {
    return themeCreator(uiConfig.colors)
  }
  return themeDefault
}
