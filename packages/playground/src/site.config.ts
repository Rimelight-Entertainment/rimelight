import type { SiteConfig } from "@rimelight/ui/config"

export const siteConfig: SiteConfig = {
  id: "playground",
  name: "Rimelight Playground",
  description: "Welcome to my website!",
  url: "https://playground.rimelight.com",
  ogImage: "/og/placeholder.webp",
  author: "Rimelight",
  email: "",
  branding: {
    logo: {
      alt: "Rimelight Playground"
    },
    favicon: {
      svg: "/favicon.svg"
    },
    colors: {
      themeColor: "#ffffff",
      backgroundColor: "#ffffff"
    }
  },
  seo: {
    titleTemplate: "%s | Rimelight Playground",
    ogImageFallback: "/og/placeholder.webp",
    maxDescriptionLength: 160
  }
}
