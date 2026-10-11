declare module "virtual:rimelight-i18n" {
  const config: {
    readonly locales: readonly string[];
    readonly defaultLocale: string;
    readonly prefixDefaultLocale: boolean;
    readonly skipPaths: readonly string[];
    readonly translations: Record<string, Record<string, unknown>>;
  };
  export default config;
}

declare module "virtual:rimelight-i18n/server" {
  const translations: Record<string, Record<string, unknown>>;
  export default translations;
}
