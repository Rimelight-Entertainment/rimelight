interface ImportMetaEnv {
  [key: string]: any;
  DEV?: boolean;
  PROD?: boolean;
  MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "virtual:rimelight-auth-config" {
  export const config: import("./types").AuthPluginConfig;
}
