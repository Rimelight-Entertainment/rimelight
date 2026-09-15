import type { SiteConfig } from "@rimelight/seo"

export const siteConfig: SiteConfig = {
  id: "rimelight.com",
  name: "Rimelight",
  description: "Welcome to my website!",
  url: "https://rimelight.com",
  author: "Rimelight",
  email: "",
  branding: {
    logo: {
      alt: "Rimelight"
    },
    colors: {
      themeColor: "#ffffff",
      backgroundColor: "#ffffff"
    }
  },
  seo: {
    titleTemplate: "%s | Rimelight",
    maxDescriptionLength: 160
  }
}
