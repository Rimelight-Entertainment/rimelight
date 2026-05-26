import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"
import { z } from "astro/zod"

const legal = defineCollection({
  loader: glob({ base: "./src/content/legal", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional()
  })
})

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) =>
    z.object({
      type: z.enum(["development-log", "other"]),
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional()
    })
})

// ── Shared schemas ────────────────────────────────────────────────────────────

const BadgeConfigSchema = z.union([
  z.string(),
  z.object({
    text: z.string(),
    color: z.string().optional(),
    variant: z.union([
      z.enum(["solid", "outline", "soft"]),
      z.enum(["note", "tip", "caution", "danger", "success", "default"])
    ]).optional().default("soft"),
    class: z.string().optional()
  })
])

const SurroundOverrideSchema = z.union([
  // false = hide the surround link entirely
  z.literal(false),
  // string shorthand = just a label override (href auto-computed)
  z.string(),
  // full override
  z.object({
    label: z.string().optional(),
    link: z.string().optional()
  })
])

const TableOfContentsSchema = z.union([
  z.literal(false),
  z.object({
    minHeadingLevel: z.number().int().min(1).max(6).optional(),
    maxHeadingLevel: z.number().int().min(1).max(6).optional()
  })
]).optional()

// ── Docs collection ───────────────────────────────────────────────────────────

const docs = defineCollection({
  loader: glob({ base: "./src/content/docs", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),

    // Explicit numeric sort order (overrides filename prefix)
    order: z.number().optional(),

    // Sidebar badge for this page
    badge: BadgeConfigSchema.optional(),

    // Starlight-compatible sidebar options
    sidebar: z.object({
      label: z.string().optional(),
      order: z.number().optional(),
      hidden: z.boolean().optional(),
      badge: BadgeConfigSchema.optional(),
      attrs: z.record(z.union([z.string(), z.number(), z.boolean()])).optional()
    }).optional(),

    // Per-page TOC override: false to disable, or config object
    tableOfContents: TableOfContentsSchema,

    // Prev/next surround overrides
    prev: SurroundOverrideSchema.optional(),
    next: SurroundOverrideSchema.optional(),

    // GitHub edit link — if not set, falls back to docs config baseUrl
    editUrl: z.union([z.string().url(), z.literal(false)]).optional()
  })
})

export const collections = {
  legal,
  blog,
  docs
}
