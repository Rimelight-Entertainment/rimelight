declare module "virtual:rimelight-seo" {
  export const config: import("./types").SeoConfig;
  export const siteConfig: import("./types").SeoConfig;
  export const SEO_LOCALES: any;
  export const PRIVATE_PATH_PREFIXES: string[];
  export const seoConfig: { SEO_LOCALES: any; PRIVATE_PATH_PREFIXES: string[] };
  export const createHead: any;
  export const createSeoHead: any;
  export const defineSeoConfig: any;
  export default config;
}
