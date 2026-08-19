import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"
import { z } from "astro/zod"

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
  docs
}
