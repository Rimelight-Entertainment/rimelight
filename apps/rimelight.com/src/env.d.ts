/// <reference types="vite/client" />
/// <reference types="vite-plus/client" />
/// <reference types="@solidjs/vite-plugin/virtual-solid-manifest" />
/// <reference types="filesystem-routing/types" />
/// <reference types="../file-routes.d.ts" />

type D1Database = import("@cloudflare/workers-types").D1Database;
type R2Bucket = import("@cloudflare/workers-types").R2Bucket;
type KVNamespace = import("@cloudflare/workers-types").KVNamespace;

type CloudflareEnv = {
  DB?: D1Database;
  BLOB: R2Bucket;
  "rimelight-dot-com_translations"?: KVNamespace;
  CONSTRUCTION_MODE?: string;
  EMAIL_DOMAIN?: string;
  AUTH0_CLIENT_SECRET?: string;
  AUTH0_SECRET?: string;
  DATABASE_URL?: string;
  CONSTRUCTION_PASSPHRASE?: string;
};

declare module "cloudflare:workers" {
  export const env: CloudflareEnv;
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
