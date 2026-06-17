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
      type: z.enum(["company-news", "development-log", "other"]),
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional()
    })
})

const docs = defineCollection({
  loader: glob({
    base: "./src/content/docs",
    pattern: "**/*.{md,mdx}",
    generateId: ({ entry }) =>
      entry
        .replace(/\/?index\.(md|mdx)$/, "")
        .replace(/\.(md|mdx)$/, "")
        .replace(/\/$/, "")
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    editUrl: z.string().optional(),
    tableOfContents: z
      .union([
        z.object({ minHeadingLevel: z.number(), maxHeadingLevel: z.number() }),
        z.literal(false)
      ])
      .optional()
  })
})

export const collections = {
  legal,
  blog,
  docs
}
