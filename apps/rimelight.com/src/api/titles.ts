/**
 * Titles that use the Rimelight client API. A title slug is the public name in URLs and in the
 * `title_settings` table. Add a slug here before a title's clients can call the API.
 */
export const TITLES = ["grand-tale"] as const;

export type TitleSlug = (typeof TITLES)[number];

export function isTitleSlug(value: string): value is TitleSlug {
  return (TITLES as readonly string[]).includes(value);
}
