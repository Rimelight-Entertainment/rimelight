import { computed } from "vue"
import { useAppConfig } from "@/config/app.config"

// Pure JavaScript deep merge helper to replace defu
function deepMerge<T extends Record<string, any>>(target: T, source: any): T {
  const output = { ...target }
  if (!source || typeof source !== "object") return output

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceVal = source[key]
      const targetVal = target[key]

      if (sourceVal && typeof sourceVal === "object" && !Array.isArray(sourceVal)) {
        if (!(key in target)) {
          Object.assign(output, { [key]: sourceVal })
        } else {
          Object.assign(output, {
            [key]: deepMerge(
              typeof targetVal === "object" && targetVal !== null ? targetVal : {},
              sourceVal
            )
          })
        }
      } else {
        if (!(key in target) || targetVal === undefined) {
          Object.assign(output, { [key]: sourceVal })
        }
      }
    }
  }
  return output
}

export function useRC<T extends Record<string, any>>(namespace: string, propsProp: T | undefined) {
  const appConfig = useAppConfig()

  const rc = computed(() => {
    const config: Record<string, any> = appConfig.rimelightComponents || {}
    const conf: Record<string, any> = config[namespace] || config[namespace.toLowerCase()] || {}
    return deepMerge<T>(propsProp ?? Object.create(null), conf.slots || conf)
  })

  return {
    rc
  }
}
