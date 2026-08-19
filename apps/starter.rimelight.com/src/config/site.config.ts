import type { SiteConfig } from "@rimelight/seo"

export const siteConfig: SiteConfig = {
  id: "starter",
  name: "Rimelight Starter",
  description: "Welcome to my website!",
  url: "https://starter.rimelight.com",
  ogImage: "https://cdn.rimelight.com/Images/og-placeholder.webp",
  author: "Rimelight",
  email: "",
  branding: {
    logo: {
      alt: "Rimelight Starter"
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
    titleTemplate: "%s | Rimelight Starter",
    ogImageFallback: "https://cdn.rimelight.com/Images/og-placeholder.webp",
    maxDescriptionLength: 160
  }
}
