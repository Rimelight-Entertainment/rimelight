import { ref } from "vue"
import enTranslations from "@/translations/en.json"

const currentLocale = ref("en")

function t(key: string, fallback?: string) {
  const parts = key.split(".")
  let current: any = enTranslations
  for (const part of parts) {
    if (current && typeof current === "object") {
      current = current[part]
    } else {
      current = undefined
      break
    }
  }
  if (typeof current === "string") {
    return current
  }
  return fallback !== undefined ? fallback : key
}

export function useI18n() {
  return {
    locale: currentLocale,
    t
  }
}
