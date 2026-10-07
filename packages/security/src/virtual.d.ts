interface ImportMetaEnv {
  [key: string]: any;
  DEV?: boolean;
  PROD?: boolean;
  MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "virtual:rimelight-security-config" {
  export const config: import("./types").SecurityPluginOptions;
}

declare module "virtual:sri-manifest" {
  export const manifest: Record<string, string>;
}
