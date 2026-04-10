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
  seo: {
    titleTemplate: string
    ogImageFallback: string
    maxDescriptionLength: number
    authorHandle?: string
  }
}
