import { defineCollection } from "./define";
import type { CollectionDefinition } from "./types";

/**
 * A starting point for a new collection. Presets are never active on their own: a project starts
 * with no collections, and a preset scaffolds one when someone creates it (Space "Start from a
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
      label: { en: "Page", es: "Page", pt: "Page" },
      labelPlural: "Pages",
      icon: "i-lucide-file",
      description: {
        en: "Standalone pages such as landing, about or contact.",
        es: "Standalone pages such as landing, about or contact.",
        pt: "Standalone pages such as landing, about or contact.",
      },
      features: { routable: "/{slug}" },
      fields: {
        seoTitle: {
          type: "text",
          label: { en: "SEO title", es: "SEO title", pt: "SEO title" },
          group: "seo",
        },
        seoDescription: {
          type: "textarea",
          label: { en: "SEO description", es: "SEO description", pt: "SEO description" },
          group: "seo",
          max: 160,
        },
        ogImage: {
          type: "media",
          label: { en: "Social image", es: "Social image", pt: "Social image" },
          group: "seo",
        },
      },
      groups: { seo: { label: { en: "SEO", es: "SEO", pt: "SEO" }, defaultOpen: false } },
    }),
  },
  {
    id: "doc",
    summary: "Documentation organised by scope and slug path (e.g. overview/getting-started).",
    definition: defineCollection({
      slug: "doc",
      label: { en: "Doc", es: "Doc", pt: "Doc" },
      labelPlural: "Docs",
      icon: "i-lucide-book-open",
      description:
        "Documentation organised by scope and slug path (e.g. overview/getting-started).",
      features: { hierarchical: true, routable: "/docs/{slug}" },
      fields: {
        scope: {
          type: "text",
          label: { en: "Scope", es: "Scope", pt: "Scope" },
          description: {
            en: "Sidebar scope; defaults to the first slug segment.",
            es: "Sidebar scope; defaults to the first slug segment.",
            pt: "Sidebar scope; defaults to the first slug segment.",
          },
        },
        scopeLabel: {
          type: "text",
          label: { en: "Scope label", es: "Scope label", pt: "Scope label" },
        },
        scopeIcon: {
          type: "text",
          label: { en: "Scope icon", es: "Scope icon", pt: "Scope icon" },
        },
        icon: {
          type: "text",
          label: { en: "Sidebar icon", es: "Sidebar icon", pt: "Sidebar icon" },
        },
        badge: {
          type: "text",
          label: { en: "Sidebar badge", es: "Sidebar badge", pt: "Sidebar badge" },
        },
        version: {
          type: "text",
          label: { en: "Version", es: "Version", pt: "Version" },
          pattern: "^v\\d",
        },
        order: { type: "number", label: { en: "Order", es: "Order", pt: "Order" } },
      },
    }),
  },
  {
    id: "wiki",
    summary: "Interlinked encyclopedia pages with infobox properties and nested sections.",
    definition: defineCollection({
      slug: "wiki",
      label: { en: "Wiki page", es: "Wiki page", pt: "Wiki page" },
      labelPlural: "Wiki",
      icon: "i-lucide-library",
      description: {
        en: "Interlinked encyclopedia pages with infobox properties and nested sections.",
        es: "Interlinked encyclopedia pages with infobox properties and nested sections.",
        pt: "Interlinked encyclopedia pages with infobox properties and nested sections.",
      },
      features: {
        hierarchical: true,
        bylines: true,
        taxonomies: ["category", "tag"],
        routable: "/wiki/{slug}",
      },
      fields: {
        summary: { type: "textarea", label: { en: "Summary", es: "Summary", pt: "Summary" } },
        image: {
          type: "media",
          label: { en: "Infobox image", es: "Infobox image", pt: "Infobox image" },
        },
        related: {
          type: "references",
          label: { en: "Related pages", es: "Related pages", pt: "Related pages" },
          collections: ["wiki"],
        },
      },
    }),
  },
  {
    id: "blog",
    summary: "Dated articles with bylines, categories and tags.",
    definition: defineCollection({
      slug: "blog",
      label: { en: "Post", es: "Post", pt: "Post" },
      labelPlural: "Blog",
      icon: "i-lucide-newspaper",
      description: {
        en: "Dated articles with bylines, categories and tags.",
        es: "Dated articles with bylines, categories and tags.",
        pt: "Dated articles with bylines, categories and tags.",
      },
      features: { bylines: true, taxonomies: ["category", "tag"], routable: "/blog/{slug}" },
      fields: {
        cover: {
          type: "media",
          label: { en: "Cover image", es: "Cover image", pt: "Cover image" },
        },
        excerpt: {
          type: "textarea",
          label: { en: "Excerpt", es: "Excerpt", pt: "Excerpt" },
          max: 300,
        },
        featured: {
          type: "boolean",
          label: { en: "Featured", es: "Featured", pt: "Featured" },
          defaultValue: false,
        },
      },
    }),
  },
  {
    id: "legal",
    summary: "Policies and legal documents that need sign-off before they go live.",
    definition: defineCollection({
      slug: "legal",
      label: { en: "Legal document", es: "Legal document", pt: "Legal document" },
      labelPlural: "Legal",
      icon: "i-lucide-scale",
      features: { routable: "/legal/{slug}" },
      workflow: { minApprovals: 1, allowSelfApproval: true },
      fields: {
        effectiveDate: {
          type: "date",
          label: { en: "Effective date", es: "Effective date", pt: "Effective date" },
        },
      },
    }),
  },
];

export function getCollectionPreset(id: string): CollectionPreset | undefined {
  return collectionPresets.find((p) => p.id === id);
}
