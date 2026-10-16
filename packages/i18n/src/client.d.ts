declare module "virtual:rimelight-i18n" {
  export const config: import("./types").I18nConfig & {
    readonly locales: readonly string[];
    readonly defaultLocale: string;
    readonly prefixDefaultLocale: boolean;
    readonly skipPaths: readonly string[];
    readonly translations: Record<string, Record<string, unknown>>;
  };
  export default config;
}
