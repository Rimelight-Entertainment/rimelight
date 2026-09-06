import type { ComponentsJSON, FlattenedTranslations } from "./types"

export function flatten(obj: ComponentsJSON): FlattenedTranslations {
  const result: FlattenedTranslations = {}
  for (const [component, translations] of Object.entries(obj)) {
    if (translations && typeof translations === "object") {
      for (const [key, value] of Object.entries(translations)) {
        if (typeof value === "string") {
          result[`${component}.${key}`] = value
        }
      }
    }
  }
  return result
}

export function unflatten(flat: FlattenedTranslations): ComponentsJSON {
  const result: ComponentsJSON = {}
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split(".")
    if (parts.length < 2) continue
    const component: string = parts[0] ?? ""
    if (!component) continue
    const translationKey = parts.slice(1).join(".")

    if (!(component in result)) {
      result[component] = {}
    }
    result[component]![translationKey] = value
  }
  return result
}

export function extractKeys(source: ComponentsJSON): string[] {
  const keys: string[] = []
  for (const [component, translations] of Object.entries(source)) {
    if (translations && typeof translations === "object") {
      for (const key of Object.keys(translations)) {
        keys.push(`${component}.${key}`)
      }
    }
  }
  return keys
}

/**
 * Compares a target translation dictionary against a base/source translation dictionary, returning
 * any missing component keys.
 */
export function findMissingKeys(
  base: Record<string, Record<string, any>>,
  target: Record<string, Record<string, any>>
): string[] {
  const missing: string[] = []
  for (const [component, keys] of Object.entries(base)) {
    if (!target[component] || typeof target[component] !== "object") {
      missing.push(component)
      continue
    }
    for (const key of Object.keys(keys)) {
      if (target[component]![key] === undefined) {
        missing.push(`${component}.${key}`)
      }
    }
  }
  return missing
}
