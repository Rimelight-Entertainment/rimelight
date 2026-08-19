import type { SiteConfig } from "@rimelight/seo"

export const siteConfig: SiteConfig = {
  id: "rimelight.com",
  name: "Rimelight",
  description: "Welcome to my website!",
  url: "https://rimelight.com",
  ogImage: "https://cdn.rimelight.com/Images/og-placeholder.webp",
  author: "Rimelight",
  email: "",
  branding: {
    logo: {
      alt: "Rimelight"
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
    titleTemplate: "%s | Rimelight",
    ogImageFallback: "https://cdn.rimelight.com/Images/og-placeholder.webp",
    maxDescriptionLength: 160
  }
}
