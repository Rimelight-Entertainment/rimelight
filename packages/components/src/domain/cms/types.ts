/**
 * Minimal shape of an Astro Content Collection entry. Explicitly allowing undefined for all common
 * SEO fields to resolve monorepo type clashes.
 */
export interface BaseCMSContentEntry {
  id: string
  data: {
    title?: string | undefined | null
    description?: string | undefined | null
    publishedDate?: Date | undefined | null
    [key: string]: any
  }
}

/**
 * Type guard to safely identify a content entry that satisfies the base library requirements.
 */
export function isBaseCMSContentEntry(entry: any): entry is BaseCMSContentEntry {
  return entry && typeof entry === "object" && "id" in entry && "data" in entry
}
