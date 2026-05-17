import defu from "defu"
import { getUIConfig } from "virtual:rimelight-ui"
import type { DefaultUIConfig } from "../themes"

export function useUi(
  componentName: keyof DefaultUIConfig,
  uiProp?: Record<string, string | undefined>
): Record<string, string | undefined> {
  const globalConfig = getUIConfig()
  const defaults = globalConfig[componentName] ?? {}
  const merged = defu(uiProp ?? {}, defaults)

  return Object.fromEntries(
    Object.entries(merged).map(([key, value]) => [
      key,
      typeof value === "string" ? value : undefined
    ])
  )
}
