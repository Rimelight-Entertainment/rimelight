declare module "virtual:rimelight-cms" {
  export const config: import("./types").CmsConfig;
}

declare module "virtual:rimelight-cms/db" {
  export const db: any;
}
