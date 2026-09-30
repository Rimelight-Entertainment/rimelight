declare module "virtual:rimelight/i18n" {
  export const locales: string[];
  export const languages: string[];
  export const defaultLocale: string;
  export const prefixDefaultLocale: boolean;
  export const translations: Record<string, Record<string, any>> | undefined;
  export default {
    locales: [] as string[],
    defaultLocale: "",
  };
}

declare module "virtual:rimelight-i18n-config" {
  export const locales: string[];
  export const languages: string[];
  export const defaultLocale: string;
  export const prefixDefaultLocale: boolean;
  export const translations: Record<string, Record<string, any>> | undefined;
}

declare module "cloudflare:workers" {
  /**
   * Ambient Cloudflare Workers env — populated at runtime by the CF runtime.
   */
  export const env: Record<string, any>;
}
