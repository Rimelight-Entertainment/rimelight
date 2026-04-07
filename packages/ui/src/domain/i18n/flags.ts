import type { Locale } from "./schema"

// Explicit locale → flag mapping
export const FLAG_CODES = {
  en: "us-4x3",
  ja: "jp-4x3",
  de: "de-4x3",
  es: "es-4x3",
  pt: "br-4x3"
} as const

export type FlagCode = (typeof FLAG_CODES)[keyof typeof FLAG_CODES]

export const localeToFlagCode = (locale: Locale): FlagCode | null => {
  return locale in FLAG_CODES ? FLAG_CODES[locale] : null
}
