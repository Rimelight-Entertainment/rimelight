import type { SiteConfig } from "@rimelight/ui/config"

export const SITE_CONFIG: SiteConfig = {
  id: "playground.rimelight.com",
  name: "Rimelight Playground",
  description: "Playground for Rimelight UI components.",
  url: "https://playground.rimelight.com",
  ogImage: "/og-default.png",
  author: "rimelight.com",
  email: "hello@rimelight.com",
  branding: {
    logo: {
      alt: "Rimelight Playground Logo"
    },
    favicon: {
      svg: "/favicon.svg"
    },
    colors: {
      themeColor: "#F94C10",
      backgroundColor: "#ffffff"
    }
  },
  seo: {
    titleTemplate: "%s | Rimelight Playground",
    ogImageFallback: "/src/assets/houston.webp",
    maxDescriptionLength: 160,
    authorHandle: "@rimelight"
  }
}

export default SITE_CONFIG
