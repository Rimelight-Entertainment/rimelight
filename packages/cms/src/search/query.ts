export const POSTGRES_SEARCH_CONFIGS: Record<string, string> = {
  en: "english",
  es: "spanish",
  de: "german",
  fr: "french"
};

export function getPostgresSearchConfig(locale: string): string {
  return POSTGRES_SEARCH_CONFIGS[locale] || "simple";
}
