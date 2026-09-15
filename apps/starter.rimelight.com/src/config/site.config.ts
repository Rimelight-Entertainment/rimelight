import type { SiteConfig } from "@rimelight/seo"

export const siteConfig: SiteConfig = {
  id: "starter",
  name: "Rimelight Starter",
  description: "Welcome to my website!",
  url: "https://starter.rimelight.com",
  author: "Rimelight",
  email: "",
  branding: {
    logo: {
      alt: "Rimelight Starter"
    },
    colors: {
      themeColor: "#ffffff",
      backgroundColor: "#ffffff"
    }
  },
  seo: {
    titleTemplate: "%s | Rimelight Starter",
    maxDescriptionLength: 160
  }
}
