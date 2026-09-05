import { defineLiveCollection } from "astro:content"
import { rimelightCmsLoader } from "@rimelight/cms"
import { db } from "#db"

const blog = defineLiveCollection({
  loader: rimelightCmsLoader({ type: "blog", db })
})

const pages = defineLiveCollection({
  loader: rimelightCmsLoader({ db })
})

export const collections = {
  blog,
  pages
}
