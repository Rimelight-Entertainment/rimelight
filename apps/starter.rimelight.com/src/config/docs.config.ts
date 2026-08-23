import { defineDocsConfig } from "@rimelight/cms"
import type { DocsConfig } from "@rimelight/cms"

const config: DocsConfig = {
  editLink: {
    baseUrl:
      "https://github.com/Rimelight-Entertainment/rimelight/edit/main/packages/starter.rimelight.com/src/content/docs/"
  },
  sidebar: [
    {
      id: "overview",
      label: "Overview",
      icon: "i-lucide-book-open",
      items: [
        { label: "Introduction", href: "/{locale}/docs/" },
        { label: "Getting Started", href: "/{locale}/docs/getting-started" }
      ]
    },
    {
      id: "features",
      label: "Features",
      icon: "i-lucide-layers",
      items: [
        { label: "Internationalization (i18n)", href: "/{locale}/docs/i18n" },
        { label: "Authentication", href: "/{locale}/docs/auth" },
        { label: "Database", href: "/{locale}/docs/database" },
        { label: "Open Graph Images", href: "/{locale}/docs/open-graph" },
        { label: "Docs System", href: "/{locale}/docs/docs-system" },
        { label: "Deployment", href: "/{locale}/docs/deployment" }
      ]
    },
    {
      id: "components",
      label: "Components",
      icon: "i-lucide-blocks",
      items: [
        { label: "Overview", href: "/{locale}/docs/components" },
        { label: "Astro Components", href: "/{locale}/docs/astro" },
        { label: "Vue Components", href: "/{locale}/docs/vue" },
        { label: "Integrations", href: "/{locale}/docs/integrations" }
      ]
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
    }
  ]
}

export default defineDocsConfig(config)
