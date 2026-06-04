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
    const component = parts[0]
    const translationKey = parts.slice(1).join(".")

    if (!(component in result)) {
      result[component] = {}
    }
    result[component][translationKey] = value
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
