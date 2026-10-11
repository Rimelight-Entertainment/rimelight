declare module "virtual:rimelight-i18n" {
  export interface RimelightI18nVirtualConfig {
    locales: readonly string[];
    defaultLocale: string;
    prefixDefaultLocale: boolean;
    skipPaths: readonly string[];
    translations: Record<string, Record<string, unknown>>;
  }

  export const locales: readonly string[];
  export const defaultLocale: string;
  export const prefixDefaultLocale: boolean;
  export const skipPaths: readonly string[];
  export const translations: Record<string, Record<string, unknown>>;
  const config: RimelightI18nVirtualConfig;
  export default config;
}

declare module "virtual:rimelight-i18n/server" {
  export const translations: Record<string, Record<string, string>>;
  export default translations;
}

declare var __rimelight_i18n:
  | {
      getStore():
        | {
            locale: string;
            translations?: Record<string, unknown> | undefined;
          }
        | undefined;
    }
  | undefined;
