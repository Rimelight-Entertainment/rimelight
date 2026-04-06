// Specify the path here without the @ alias, since we use this file in astro.config.ts
import { SITE_CONFIG, LINKS } from "../../config"

export const SEO_DEFAULTS = {
  siteName: SITE_CONFIG.name,

  baseUrl: SITE_CONFIG.url,

  // Dynamically inserting a name into a template
  titleTemplate: `%s | ${SITE_CONFIG.name}`,

  // Other SEO-specific things
  ogImageFallback: `/src/assets/houston.webp`,
  defaultDescription: "Production-ready foundations for SaaS and Telegram Mini Apps",
  maxDescriptionLength: 160,
  author: {
    name: "Gary Stupak",
    url: LINKS.twitter
  }
} as const
