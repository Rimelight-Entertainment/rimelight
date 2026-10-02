/// <reference types="vite-plus/client" />
/// <reference types="@solidjs/vite-plugin/virtual-solid-manifest" />

declare module "cloudflare:workers" {
  export const env: import("../cloudflare.config").Env;
}

declare module "virtual:rimelight/seo" {
  export const siteConfig: {
    name: string;
    title: string;
    description: string;
    url: string;
    image?: string;
    [key: string]: any;
  };
  export const SEO_LOCALES: Record<string, string> | undefined;
  export const PRIVATE_PATH_PREFIXES: string[];
  export const seoConfig: {
    SEO_LOCALES?: Record<string, string>;
    PRIVATE_PATH_PREFIXES: string[];
  };
  export default siteConfig;
}

declare module "virtual:rimelight-ui-docs-meta" {
  const meta: Record<string, any>;
  export default meta;
}

declare module "astro:content" {
  export const getCollection: (collection: string) => Promise<any[]>;
  export const getEntry: (collection: string, slug: string) => Promise<any>;
}
