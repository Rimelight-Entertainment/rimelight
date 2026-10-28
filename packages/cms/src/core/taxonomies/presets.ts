import type { TaxonomyDefinition } from "../types/taxonomies";

/**
 * A starting point for a new taxonomy (vocabulary). Like collection presets, nothing is created
 * automatically: a project starts with no taxonomies and scaffolds the ones it wants.
 */
export interface TaxonomyPreset {
  /** Stable id used by the API, e.g. `category`. */
  id: string;
  /** One line shown in the preset picker. */
  summary: string;
  definition: TaxonomyDefinition;
}

export const taxonomyPresets: TaxonomyPreset[] = [
  {
    id: "category",
    summary: "Nested topics, e.g. Guides > Setup. Good for sorting content into sections.",
    definition: {
      slug: "category",
      label: { en: "Categories", es: "Categories", pt: "Categories" },
      hierarchical: true,
    },
  },
  {
    id: "tag",
    summary: "Flat keywords for cross-cutting labels.",
    definition: { slug: "tag", label: { en: "Tags", es: "Tags", pt: "Tags" }, hierarchical: false },
  },
];

export function getTaxonomyPreset(id: string): TaxonomyPreset | undefined {
  return taxonomyPresets.find((p) => p.id === id);
}
