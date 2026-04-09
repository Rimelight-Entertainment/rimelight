import { computed, type ComputedRef } from "vue"
import defu from "defu"
import { getUIConfig } from "virtual:rimelight-ui"
import type { DefaultUIConfig } from "../themes"

/**
 * Reactive UI config merge composable for Vue components.
 *
 * Merges (highest priority first): 1. Local `ui` prop override 2. Global config from integration
 * (virtual:rimelight-ui)
 *
 * @param componentName - The component key in the config (e.g. 'button')
 * @param uiProp - The local `ui` prop from defineProps
 * @returns ComputedRef of merged UI overrides
 */
export function useComponentUI<T extends keyof DefaultUIConfig>(
  componentName: T,
  uiProp: Record<string, unknown> | undefined
): ComputedRef<Record<string, unknown>> {
  const globalConfig = getUIConfig()

  return computed(() => {
    const componentConfig = globalConfig[componentName]

    return defu(uiProp ?? {}, componentConfig ?? {})
  })
}
