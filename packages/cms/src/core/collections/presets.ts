import { defineCollection } from "./define";
import type { CollectionDefinition } from "./types";

/**
 * A starting point for a new collection. Presets are never active on their own: a project starts
 * with no collections, and a preset scaffolds one when someone creates it (dashboard "Start from a
 * preset", or `createCollectionFromPreset`). Once created it's an ordinary database collection and
 * the preset is no longer referenced.
 */
export interface CollectionPreset {
  /** Stable id used by the API, e.g. `blog`. */
  id: string;
  /** One line shown in the preset picker. */
  summary: string;
  /** The collection this preset creates. `slug` is the default and can be overridden on create. */
  definition: CollectionDefinition;
}

export const collectionPresets: CollectionPreset[] = [
  {
    id: "page",
    summary: "Standalone pages such as landing, about or contact.",
    definition: defineCollection({
      slug: "page",
      label: "Page",
      labelPlural: "Pages",
      icon: "i-lucide-file",
      description: "Standalone pages such as landing, about or contact.",
      features: { routable: "/{slug}" },
      fields: {
        seoTitle: { type: "text", label: "SEO title", group: "seo" },
        seoDescription: { type: "textarea", label: "SEO description", group: "seo", max: 160 },
        ogImage: { type: "media", label: "Social image", group: "seo" },
      },
      groups: { seo: { label: "SEO", defaultOpen: false } },
    }),
  },
  {
    id: "doc",
    summary: "Documentation organised by scope and slug path (e.g. overview/getting-started).",
    definition: defineCollection({
      slug: "doc",
      label: "Doc",
      labelPlural: "Docs",
      icon: "i-lucide-book-open",
      description:
        "Documentation organised by scope and slug path (e.g. overview/getting-started).",
      features: { hierarchical: true, routable: "/docs/{slug}" },
      fields: {
        scope: {
          type: "text",
          label: "Scope",
          description: "Sidebar scope; defaults to the first slug segment.",
        },
        scopeLabel: { type: "text", label: "Scope label" },
        scopeIcon: { type: "text", label: "Scope icon" },
        icon: { type: "text", label: "Sidebar icon" },
        badge: { type: "text", label: "Sidebar badge" },
        version: { type: "text", label: "Version", pattern: "^v\\d" },
        order: { type: "number", label: "Order" },
      },
    }),
  },
  {
    id: "wiki",
    summary: "Interlinked encyclopedia pages with infobox properties and nested sections.",
    definition: defineCollection({
      slug: "wiki",
      label: "Wiki page",
      labelPlural: "Wiki",
      icon: "i-lucide-library",
      description: "Interlinked encyclopedia pages with infobox properties and nested sections.",
      features: {
        hierarchical: true,
        bylines: true,
        taxonomies: ["category", "tag"],
        routable: "/wiki/{slug}",
      },
      fields: {
        summary: { type: "textarea", label: "Summary" },
        image: { type: "media", label: "Infobox image" },
        related: { type: "references", label: "Related pages", collections: ["wiki"] },
      },
    }),
  },
  {
    id: "blog",
    summary: "Dated articles with bylines, categories and tags.",
    definition: defineCollection({
      slug: "blog",
      label: "Post",
      labelPlural: "Blog",
      icon: "i-lucide-newspaper",
      description: "Dated articles with bylines, categories and tags.",
      features: { bylines: true, taxonomies: ["category", "tag"], routable: "/blog/{slug}" },
      fields: {
        cover: { type: "media", label: "Cover image" },
        excerpt: { type: "textarea", label: "Excerpt", max: 300 },
        featured: { type: "boolean", label: "Featured", defaultValue: false },
      },
    }),
  },
  {
    id: "legal",
    summary: "Policies and legal documents that need sign-off before they go live.",
    definition: defineCollection({
      slug: "legal",
      label: "Legal document",
      labelPlural: "Legal",
      icon: "i-lucide-scale",
      features: { routable: "/legal/{slug}" },
      workflow: { minApprovals: 1, allowSelfApproval: false },
      fields: { effectiveDate: { type: "date", label: "Effective date" } },
    }),
  },
];

export function getCollectionPreset(id: string): CollectionPreset | undefined {
  return collectionPresets.find((p) => p.id === id);
}
