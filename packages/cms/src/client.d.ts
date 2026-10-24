declare module "virtual:rimelight-cms" {
  /** User config from `cms.config.ts` (empty object when absent). */
  export const config: import("./types").CmsConfig;
  /** Serializable plugin options. */
  export const options: import("./types").CmsPluginOptions;
}
