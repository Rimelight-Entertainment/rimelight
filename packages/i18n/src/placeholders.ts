/** Matches `{name}` and `{ name }`. The runtime substitutes with it; everything else reads names from it. */
export const PLACEHOLDER = /\{\s*(\w+)\s*}/g;

const collect = (value: unknown, names: string[]): string[] => {
  if (typeof value === "string") {
    for (const match of value.matchAll(PLACEHOLDER)) names.push(match[1]!);
  } else if (Array.isArray(value)) {
    for (const item of value) collect(item, names);
  } else if (value && typeof value === "object") {
    for (const item of Object.values(value)) collect(item, names);
  }
  return names;
};

/** Unique placeholder names in a translation value, searched through arrays and nested objects. */
export const placeholderNames = (value: unknown): string[] => [...new Set(collect(value, []))];
