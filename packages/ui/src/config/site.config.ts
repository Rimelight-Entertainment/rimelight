export interface SiteConfig {
  id: string
  name: string
  description: string
  url: string
  ogImage: string
  author: string
  email: string
  branding: {
    logo: {
      alt: string
    }
    favicon: {
      svg: string
    }
    colors: {
      themeColor: string
      backgroundColor: string
    }
  }
}

export const SITE_CONFIG: SiteConfig = {
  id: "danielmarchi.dev",
  name: "Daniel Marchi",
  description: "A portfolio website built with Astro.",
  url: "https://danielmarchi.dev",
  ogImage: "/og-default.png",
  author: "Daniel Marchi",
  email: "hello@danielmarchi.dev",
  branding: {
    logo: {
      alt: "Daniel Marchi"
    },
    favicon: {
      svg: "/favicon.svg"
    },
    colors: {
      themeColor: "#F94C10",
      backgroundColor: "#ffffff"
    }
  }
}

export default SITE_CONFIG
