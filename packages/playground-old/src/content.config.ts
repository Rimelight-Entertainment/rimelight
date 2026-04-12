import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"
import { z } from "astro/zod"

const socialLinks = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/social-links" }),
  schema: z.object({
    icon: z.string(),
    label: z.string(),
    url: z.url()
  })
})

export const collections = {
  socialLinks
}
