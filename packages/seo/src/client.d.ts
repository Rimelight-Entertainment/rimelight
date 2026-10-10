declare module "virtual:rimelight-seo" {
  export const siteConfig: import("./types").SiteConfig;
  export const SEO_LOCALES: any;
  export const PRIVATE_PATH_PREFIXES: string[];
  export const seoConfig: { SEO_LOCALES: any; PRIVATE_PATH_PREFIXES: string[] };
  export const createHead: any;
  export const createSeoHead: any;
  export const defineSeoConfig: any;
  export default siteConfig;
}

declare module "virtual:rimelight-seo/server" {
  export const masterIconBuffer: Uint8Array | null;
  export const isSvg: boolean;
  export const backgroundColor: string;
  export const db: any;
  export const corpusPages: any[];
  const defaultExport: {
    masterIconBuffer: Uint8Array | null;
    isSvg: boolean;
    backgroundColor: string;
    db: any;
    corpusPages: any[];
  };
  export default defaultExport;
}
