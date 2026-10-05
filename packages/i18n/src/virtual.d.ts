declare module "virtual:rimelight-i18n-config" {
  export const locales: string[];
  export const defaultLocale: string;
  export const prefixDefaultLocale: boolean;
  export const translations: Record<string, Record<string, any>> | undefined;
}
