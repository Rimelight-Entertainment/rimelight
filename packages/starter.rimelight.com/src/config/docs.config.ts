import { defineDocsConfig } from "@rimelight/ui/utils"

export default defineDocsConfig({
  editLink: {
    baseUrl:
      "https://github.com/rimelight/rimelight/edit/main/packages/playground/src/content/docs/"
  },
  sidebar: [
    {
      id: "overview",
      label: "Overview",
      href: "/{locale}/docs/",
      icon: "i-lucide-book-open",
      items: [{ label: "Home", href: "/{locale}/docs/" }]
    }
  ]
})
