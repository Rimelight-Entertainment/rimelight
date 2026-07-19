import { ref } from "vue"

function translate(key: string, fallback?: string) {
  if (fallback !== undefined) return fallback
  const parts = key.split(".")
  return parts[parts.length - 1] || key
}

export function useI18n() {
  const locale = ref("en")
  return { t: translate, locale }
}

function addToast(options: { title?: string; description?: string; color?: string }) {
  if (typeof window !== "undefined") {
    console.log(
      `[Toast ${options.color || "info"}]: ${options.title || ""} ${options.description || ""}`
    )
  }
}

export function useToast() {
  return { add: addToast }
}
