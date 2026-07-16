import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"
import { z } from "astro/zod"

const legal = defineCollection({
  loader: glob({ base: "./src/content/legal", pattern: "**/*.{md,mdx}", deferRender: true }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional()
  })
})

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}", deferRender: true }),
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

const docs = defineCollection({
  loader: glob({
    base: "./src/content/docs",
    pattern: "**/*.{md,mdx}",
    deferRender: true,
    generateId: ({ entry }) =>
      entry
        .replace(/\/?index\.(md|mdx)$/, "")
        .replace(/\.(md|mdx)$/, "")
        .replace(/\/$/, "")
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    editUrl: z.union([z.url(), z.literal(false)]).optional(),
    tableOfContents: z
      .union([
        z.object({
          minHeadingLevel: z.number().optional(),
          maxHeadingLevel: z.number().optional()
        }),
        z.literal(false)
      ])
      .optional(),
    prev: z
      .object({
        label: z.string(),
        href: z.string()
      })
      .nullable()
      .optional(),
    next: z
      .object({
        label: z.string(),
        href: z.string()
      })
      .nullable()
      .optional()
  })
})

export const collections = {
  legal,
  blog,
  docs
}
