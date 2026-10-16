declare module "virtual:rimelight-cms" {
  export const config: import("./types").CmsConfig;
  export default config;
}

declare module "virtual:rimelight-cms/db" {
  export const db: any;
  const defaultExport: any;
  export default defaultExport;
}
