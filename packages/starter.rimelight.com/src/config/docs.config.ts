import { defineDocsConfig } from "@rimelight/docs"

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
    },
    {
      id: "foundation",
      label: "Foundation",
      icon: "i-lucide-layout",
      items: [
        { label: "Design Tokens", href: "/{locale}/docs/tokens" },
        { label: "Color Palettes", href: "/{locale}/docs/colors" },
        { label: "Fluid Typography", href: "/{locale}/docs/typography" },
        { label: "Search & Database", href: "/{locale}/docs/search-db" }
      ]
    },
    {
      id: "components",
      label: "Components",
      icon: "i-lucide-blocks",
      items: [
        { label: "Astro Elements", href: "/{locale}/docs/astro" },
        { label: "Vue Components", href: "/{locale}/docs/vue" },
        { label: "Integrations", href: "/{locale}/docs/integrations" }
      ]
    }
  ]
})
