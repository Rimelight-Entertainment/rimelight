declare module "virtual:rimelight-i18n-config" {
  export const locales: string[];
  export const defaultLocale: string;
  export const prefixDefaultLocale: boolean;
  export const htmlLangs: Record<string, string>;
  export const translations: Record<string, Record<string, any>>;
  export const kvBinding: string;
  export const skipPaths: string[];
  const config: {
    locales: string[];
    defaultLocale: string;
    prefixDefaultLocale: boolean;
    htmlLangs: Record<string, string>;
    translations: Record<string, Record<string, any>>;
    kvBinding: string;
    skipPaths: string[];
  };
  export default config;
}
